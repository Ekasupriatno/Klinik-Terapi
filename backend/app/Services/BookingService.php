<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Doctor;
use App\Models\Schedule;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;

class BookingService
{
    /**
     * Membuat booking baru dengan proteksi transaksi dan pessimistic lock
     * untuk menjamin ZERO DOUBLE-BOOKING.
     */
    public function createBooking(User $user, array $data): Booking
    {
        return DB::transaction(function () use ($user, $data) {
            $appointmentDate = Carbon::parse($data['appointment_date'])->toDateString();
            $appointmentTime = Carbon::parse($data['appointment_time'])->format('H:i:s');

            // 1. Verifikasi dokter aktif
            $doctor = Doctor::active()->findOrFail($data['doctor_id']);

            // 2. Proteksi Concurrency: Lock baris booking dokter di waktu yang sama
            $existingBooking = Booking::where('doctor_id', $doctor->id)
                ->where('appointment_date', $appointmentDate)
                ->where('appointment_time', $appointmentTime)
                ->whereNotIn('status', ['cancelled'])
                ->lockForUpdate()
                ->first();

            if ($existingBooking) {
                throw ValidationException::withMessages([
                    'appointment_time' => ['Maaf, slot waktu ini baru saja dipesan oleh pasien lain. Silakan pilih slot waktu lain.'],
                ]);
            }

            // 3. Hitung end_time berdasarkan slot_duration jadwal (default 30 menit)
            $durationMinutes = 30;
            if (!empty($data['schedule_id'])) {
                $schedule = Schedule::find($data['schedule_id']);
                if ($schedule) {
                    $durationMinutes = $schedule->slot_duration_minutes;
                }
            }

            $endTime = Carbon::parse($appointmentTime)->addMinutes($durationMinutes)->format('H:i:s');

            // 4. Generate kode booking unik manusiawi: KT-YYYYMM-XXXX
            $uniqueCode = 'KT-' . Carbon::now()->format('Ym') . '-' . strtoupper(Str::random(5));

            // 5. Simpan booking baru
            return Booking::create([
                'booking_code' => $uniqueCode,
                'user_id' => $user->id,
                'doctor_id' => $doctor->id,
                'schedule_id' => $data['schedule_id'] ?? null,
                'appointment_date' => $appointmentDate,
                'appointment_time' => $appointmentTime,
                'end_time' => $endTime,
                'status' => 'pending',
                'patient_complaint' => $data['patient_complaint'],
            ]);
        });
    }

    /**
     * Batalkan booking oleh pasien atau admin
     */
    public function cancelBooking(Booking $booking, User $actor, ?string $reason = null): Booking
    {
        // Validasi hak akses (hanya pemilik atau admin yang berhak membatalkan)
        if (!$actor->isAdmin() && $booking->user_id !== $actor->id) {
            throw ValidationException::withMessages([
                'unauthorized' => ['Anda tidak berhak membatalkan booking ini.'],
            ]);
        }

        if (!$booking->canBeCancelled()) {
            throw ValidationException::withMessages([
                'status' => ['Booking dengan status saat ini tidak dapat dibatalkan.'],
            ]);
        }

        $booking->update([
            'status' => 'cancelled',
            'cancel_reason' => $reason ?: 'Dibatalkan oleh ' . ($actor->isAdmin() ? 'Admin' : 'Pasien'),
        ]);

        return $booking->fresh();
    }

    /**
     * Update status booking oleh Admin (approve, complete, etc.)
     */
    public function updateStatus(Booking $booking, string $newStatus, ?string $notes = null): Booking
    {
        $allowed = ['pending', 'confirmed', 'in_consultation', 'completed', 'cancelled', 'no_show'];
        if (!in_array($newStatus, $allowed)) {
            throw ValidationException::withMessages([
                'status' => ['Status booking tidak valid.'],
            ]);
        }

        $updates = ['status' => $newStatus];
        if ($notes !== null) {
            $updates['doctor_notes'] = $notes;
        }

        if ($newStatus === 'confirmed' && !$booking->confirmed_at) {
            $updates['confirmed_at'] = Carbon::now();
        }

        $booking->update($updates);

        return $booking->fresh();
    }
}
