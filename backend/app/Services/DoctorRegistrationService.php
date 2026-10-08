<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Doctor;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class DoctorRegistrationService
{
    /**
     * Register a new doctor with clean database transaction.
     *
     * @param array $validatedData
     * @param UploadedFile|null $photo
     * @return array{user: User, doctor: Doctor}
     * @throws Throwable
     */
    public function registerDoctor(array $validatedData, ?UploadedFile $photo = null): array
    {
        $uploadedPath = null;

        try {
            // 1. Process profile photo if uploaded
            if ($photo && $photo->isValid()) {
                // Ensure storage directory exists
                $uploadedPath = $photo->store('doctors', 'public');
            }

            // 2. Perform DB Transaction
            return DB::transaction(function () use ($validatedData, $uploadedPath) {
                // Find or match specialization if it exists in master table
                $matchedSpec = Specialization::where('name', 'like', trim($validatedData['specialization']))->first();

                // 2a. Create User with enforced 'doctor' role
                $user = User::create([
                    'name' => $validatedData['name'],
                    'email' => strtolower(trim($validatedData['email'])),
                    'phone' => $validatedData['phone'],
                    'password' => Hash::make($validatedData['password']),
                    'role' => 'doctor', // ENFORCED BY BACKEND ONLY
                    'status' => 'pending',
                ]);

                // Photo URL
                $photoUrl = $uploadedPath ? asset('storage/' . $uploadedPath) : null;

                // 2b. Create Doctor profile with status 'pending'
                $doctor = Doctor::create([
                    'user_id' => $user->id,
                    'specialization_id' => $matchedSpec?->id,
                    'specialization' => $validatedData['specialization'],
                    'name' => $validatedData['name'],
                    'license_number' => $validatedData['license_number'],
                    'sip_number' => $validatedData['license_number'], // keep in sync
                    'phone' => $validatedData['phone'],
                    'gender' => $validatedData['gender'],
                    'birth_date' => $validatedData['birth_date'],
                    'address' => $validatedData['address'],
                    'education' => $validatedData['education'],
                    'experience_years' => (int) $validatedData['experience_years'],
                    'bio' => $validatedData['bio'] ?? null,
                    'profile_photo' => $uploadedPath,
                    'image_url' => $photoUrl,
                    'status' => 'pending', // MUST BE PENDING
                    'is_active' => false,  // CANNOT BE ACTIVE UNTIL ADMIN APPROVAL
                ]);

                // 2c. Send Email Verification Notification
                try {
                    $user->sendEmailVerificationNotification();
                } catch (Throwable $mailException) {
                    Log::warning('Email verification notification could not be sent: ' . $mailException->getMessage());
                }

                // 2d. Audit Log if table exists
                try {
                    AuditLog::create([
                        'user_id' => $user->id,
                        'action' => 'DOCTOR_REGISTRATION',
                        'description' => "Dokter {$user->name} mendaftar (Status: Pending, No. Lisensi: {$doctor->license_number})",
                        'ip_address' => request()->ip(),
                        'user_agent' => request()->userAgent(),
                    ]);
                } catch (Throwable) {
                    // Fail silently for audit log
                }

                return [
                    'user' => $user,
                    'doctor' => $doctor,
                ];
            });
        } catch (Throwable $e) {
            // Clean up uploaded file if database transaction failed
            if ($uploadedPath && Storage::disk('public')->exists($uploadedPath)) {
                Storage::disk('public')->delete($uploadedPath);
            }

            Log::error('Doctor registration failed: ' . $e->getMessage(), [
                'exception' => $e,
                'email' => $validatedData['email'] ?? null,
            ]);

            throw $e;
        }
    }
}
