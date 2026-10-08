<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterDoctorRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\Doctor;
use App\Models\Guardian;
use App\Models\User;
use App\Services\DoctorRegistrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Registrasi khusus dokter (Status: Pending, menunggu verifikasi Admin).
     */
    public function registerDoctor(
        RegisterDoctorRequest $request,
        DoctorRegistrationService $registrationService
    ): JsonResponse {
        $result = $registrationService->registerDoctor(
            $request->validated(),
            $request->file('profile_photo')
        );

        return response()->json([
            'success' => true,
            'message' => 'Registrasi dokter berhasil. Akun Anda sedang menunggu verifikasi admin.',
            'data' => [
                'id' => $result['doctor']->id,
                'user_id' => $result['user']->id,
                'name' => $result['user']->name,
                'email' => $result['user']->email,
                'role' => $result['user']->role,
                'status' => $result['doctor']->status,
                'license_number' => $result['doctor']->license_number,
                'specialization' => $result['doctor']->specialization,
            ],
        ], 201);
    }

    /**
     * Registrasi akun pasien / umum (Admin TIDAK BISA didaftarkan lewat register publik).
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        // Enforce role security: public register can only register parent / patient
        $role = 'parent';

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => $role,
            'status' => 'active',
        ]);

        // Create guardian profile for parent
        $user->guardian()->create([
            'phone' => $request->phone,
            'relationship_to_child' => 'parent',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registrasi akun berhasil.',
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ], 201);
    }

    /**
     * Login user (Pasien, Dokter, Admin)
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Kombinasi email dan kata sandi tidak cocok.'],
            ]);
        }

        // Pengecekan status untuk role dokter
        if ($user->role === 'doctor' || $user->doctor()->exists()) {
            $doctor = $user->doctor;

            if ($doctor) {
                if ($doctor->status === 'pending') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Akun dokter Anda masih menunggu verifikasi admin.',
                    ], 403);
                }

                if ($doctor->status === 'rejected') {
                    $reason = $doctor->rejection_reason ? ' Alasan: ' . $doctor->rejection_reason : '';
                    return response()->json([
                        'success' => false,
                        'message' => 'Pendaftaran akun dokter Anda ditolak. Silakan hubungi admin klinik.' . $reason,
                    ], 403);
                }

                if ($doctor->status === 'suspended') {
                    $reason = $doctor->rejection_reason ? ' Alasan: ' . $doctor->rejection_reason : '';
                    return response()->json([
                        'success' => false,
                        'message' => 'Akun dokter Anda sedang ditangguhkan. Silakan hubungi admin klinik.' . $reason,
                    ], 403);
                }

                if ($doctor->status !== 'approved') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Akun dokter Anda belum disetujui.',
                    ], 403);
                }
            }
        }

        // Update last login
        $user->update(['last_login_at' => now()]);

        // Hapus token lama untuk perangkat ini jika diinginkan, lalu buat baru
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil. Selamat datang kembali!',
            'data' => [
                'user' => new UserResource($user->loadMissing('doctor')),
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ]);
    }

    /**
     * Mengambil profil user saat ini
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new UserResource($request->user()),
        ]);
    }

    /**
     * Logout dan revoke token
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
        ]);
    }

    /**
     * Send password reset link
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'success' => true,
                'message' => 'Link reset password telah dikirim ke email Anda.',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Gagal mengirim link reset password.',
        ], 400);
    }

    /**
     * Reset password
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:6|max:128|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'success' => true,
                'message' => 'Password berhasil direset.',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Gagal mereset password. Token mungkin tidak valid atau telah kadaluarsa.',
        ], 400);
    }
}
