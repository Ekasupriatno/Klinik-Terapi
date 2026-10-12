<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AccountController extends Controller
{
    /**
     * Buat akun admin baru (hanya untuk super_admin / admin).
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorizeAdminAccountManagement($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'min:10', 'max:15', 'regex:/^(\+62|62|0)8[1-9][0-9]{6,11}$/'],
            'password' => [
                'required',
                'string',
                'min:8',
                'max:128',
                'confirmed',
                Password::min(8)->mixedCase()->numbers()->symbols(),
            ],
        ], [
            'password.min' => 'Kata sandi minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => strtolower(trim($validated['email'])),
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'role' => 'admin',
        ]);

        AuditLog::log(
            action: 'CREATE_ADMIN_ACCOUNT',
            entity: 'User',
            entityId: $user->id,
            oldValues: null,
            newValues: ['name' => $user->name, 'email' => $user->email, 'role' => 'admin']
        );

        return response()->json([
            'success' => true,
            'message' => 'Akun admin berhasil dibuat.',
            'data' => new UserResource($user),
        ], 201);
    }

    /**
     * Perbarui email dan nama admin yang sedang login.
     * Memerlukan verifikasi kata sandi saat ini untuk keamanan tingkat tinggi.
     */
    public function updateEmail(Request $request): JsonResponse
    {
        $this->authorizeAdminAccountManagement($request);

        $user = $request->user();

        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'current_password' => ['required', 'string'],
        ], [
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah terdaftar oleh pengguna lain.',
            'current_password.required' => 'Kata sandi saat ini wajib diisi untuk memverifikasi identitas Anda.',
        ]);

        // Verifikasi kata sandi saat ini agar akun tidak bisa di-bajak tanpa kata sandi
        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Kata sandi saat ini tidak sesuai. Perubahan email dibatalkan untuk keamanan.'],
            ]);
        }

        $oldEmail = $user->email;
        $newEmail = strtolower(trim($validated['email']));
        
        $updates = ['email' => $newEmail];
        if (!empty($validated['name'])) {
            $updates['name'] = trim($validated['name']);
        }

        $user->update($updates);

        AuditLog::log(
            action: 'UPDATE_ADMIN_EMAIL',
            entity: 'User',
            entityId: $user->id,
            oldValues: ['email' => $oldEmail],
            newValues: ['email' => $newEmail, 'name' => $user->name]
        );

        return response()->json([
            'success' => true,
            'message' => 'Email dan profil admin berhasil diperbarui.',
            'data' => new UserResource($user->fresh()),
        ]);
    }

    /**
     * Ubah kata sandi admin dengan validasi ketat (min 8 karakter, huruf besar/kecil, angka, simbol).
     * Otomatis mencabut sesi / token di perangkat lain demi keamanan.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $this->authorizeAdminAccountManagement($request);

        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => [
                'required',
                'string',
                'min:8',
                'max:128',
                'different:current_password',
                'confirmed',
                Password::min(8)->mixedCase()->numbers()->symbols(),
            ],
        ], [
            'current_password.required' => 'Kata sandi saat ini wajib diisi.',
            'password.required' => 'Kata sandi baru wajib diisi.',
            'password.min' => 'Kata sandi baru minimal 8 karakter.',
            'password.different' => 'Kata sandi baru tidak boleh sama dengan kata sandi saat ini.',
            'password.confirmed' => 'Konfirmasi kata sandi baru tidak cocok.',
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Kata sandi saat ini tidak sesuai.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        // Perketat keamanan: Hapus seluruh token sesi di perangkat lain
        if ($user->currentAccessToken()) {
            $user->tokens()->where('id', '!=', $user->currentAccessToken()->id)->delete();
        }

        AuditLog::log(
            action: 'CHANGE_ADMIN_PASSWORD',
            entity: 'User',
            entityId: $user->id,
            oldValues: null,
            newValues: ['revoked_other_tokens' => true]
        );

        return response()->json([
            'success' => true,
            'message' => 'Kata sandi admin berhasil diperbarui. Sesi perangkat lain telah ditutup demi keamanan.',
        ]);
    }

    private function authorizeAdminAccountManagement(Request $request): void
    {
        abort_unless(in_array($request->user()->role, ['super_admin', 'admin'], true), 403);
    }
}
