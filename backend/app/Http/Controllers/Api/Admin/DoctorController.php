<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\DoctorResource;
use App\Models\AuditLog;
use App\Models\Doctor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DoctorController extends Controller
{
    /**
     * Menampilkan daftar dokter yang berstatus pending (menunggu verifikasi admin).
     */
    public function pending(Request $request): JsonResponse
    {
        $pendingDoctors = Doctor::with(['user', 'specialization'])
            ->where('status', 'pending')
            ->latest()
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => DoctorResource::collection($pendingDoctors),
            'pagination' => [
                'current_page' => $pendingDoctors->currentPage(),
                'last_page' => $pendingDoctors->lastPage(),
                'per_page' => $pendingDoctors->perPage(),
                'total' => $pendingDoctors->total(),
            ],
        ]);
    }

    /**
     * Menampilkan detail lengkap dokter tertentu untuk review verifikasi.
     */
    public function show(int $id): JsonResponse
    {
        $doctor = Doctor::with(['user', 'specialization', 'reviews.user', 'schedules'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new DoctorResource($doctor),
        ]);
    }

    /**
     * Menyetujui dokter (pending -> approved).
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        $doctor = Doctor::with('user')->findOrFail($id);

        if ($doctor->status === 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Dokter ini sudah berstatus disetujui (approved).',
            ], 422);
        }

        DB::transaction(function () use ($doctor, $request) {
            $doctor->update([
                'status' => 'approved',
                'is_active' => true,
                'rejection_reason' => null,
            ]);

            if ($doctor->user) {
                $doctor->user->update([
                    'status' => 'active',
                ]);
            }

            try {
                AuditLog::create([
                    'user_id' => $request->user()?->id,
                    'action' => 'APPROVE_DOCTOR',
                    'description' => "Admin menyetujui akun dokter {$doctor->name} (ID: {$doctor->id})",
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);
            } catch (\Throwable) {
                // Ignore audit log error
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Akun dokter berhasil disetujui dan telah aktif.',
            'data' => new DoctorResource($doctor->fresh(['user', 'specialization'])),
        ]);
    }

    /**
     * Menolak dokter (pending -> rejected).
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $doctor = Doctor::with('user')->findOrFail($id);

        $reason = $request->input('reason', 'Kualifikasi atau dokumen lisensi belum memenuhi persyaratan.');

        DB::transaction(function () use ($doctor, $reason, $request) {
            $doctor->update([
                'status' => 'rejected',
                'is_active' => false,
                'rejection_reason' => $reason,
            ]);

            if ($doctor->user) {
                $doctor->user->update([
                    'status' => 'rejected',
                ]);
                // Revoke any tokens
                $doctor->user->tokens()->delete();
            }

            try {
                AuditLog::create([
                    'user_id' => $request->user()?->id,
                    'action' => 'REJECT_DOCTOR',
                    'description' => "Admin menolak akun dokter {$doctor->name} (Alasan: {$reason})",
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);
            } catch (\Throwable) {
                // Ignore audit log error
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran akun dokter telah ditolak.',
            'data' => new DoctorResource($doctor->fresh(['user', 'specialization'])),
        ]);
    }

    /**
     * Menangguhkan akun dokter (approved -> suspended).
     */
    public function suspend(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $doctor = Doctor::with('user')->findOrFail($id);

        $reason = $request->input('reason', 'Akun ditangguhkan oleh Administrator Klinik.');

        DB::transaction(function () use ($doctor, $reason, $request) {
            $doctor->update([
                'status' => 'suspended',
                'is_active' => false,
                'rejection_reason' => $reason,
            ]);

            if ($doctor->user) {
                $doctor->user->update([
                    'status' => 'suspended',
                ]);
                // Revoke all active tokens for this doctor so they are immediately logged out
                $doctor->user->tokens()->delete();
            }

            try {
                AuditLog::create([
                    'user_id' => $request->user()?->id,
                    'action' => 'SUSPEND_DOCTOR',
                    'description' => "Admin menangguhkan akun dokter {$doctor->name} (Alasan: {$reason})",
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);
            } catch (\Throwable) {
                // Ignore audit log error
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Akun dokter berhasil ditangguhkan.',
            'data' => new DoctorResource($doctor->fresh(['user', 'specialization'])),
        ]);
    }
}
