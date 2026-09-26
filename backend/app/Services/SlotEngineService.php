<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Doctor;
use App\Models\Schedule;
use Carbon\Carbon;

class SlotEngineService
{
    /**
     * Hitung semua slot waktu beserta status ketersediaannya untuk dokter dan tanggal tertentu.
     */
    public function getAvailableSlots(int $doctorId, string $dateString): array
    {
        $date = Carbon::parse($dateString);
        $dayOfWeek = strtolower($date->format('l')); // 'monday', 'tuesday', etc.

        // Ambil jadwal aktif dokter pada hari tersebut
        $schedules = Schedule::where('doctor_id', $doctorId)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_active', true)
            ->get();

        if ($schedules->isEmpty()) {
            return [
                'doctor_id' => $doctorId,
                'date' => $date->toDateString(),
                'day' => $dayOfWeek,
                'is_open' => false,
                'message' => 'Dokter tidak memiliki jadwal praktek pada hari ini.',
                'slots' => [],
            ];
        }

        // Ambil semua booking yang aktif (tidak dibatalkan) pada tanggal tersebut
        $bookedSlots = Booking::where('doctor_id', $doctorId)
            ->where('appointment_date', $date->toDateString())
            ->whereNotIn('status', ['cancelled'])
            ->pluck('appointment_time')
            ->map(fn($time) => Carbon::parse($time)->format('H:i'))
            ->toArray();

        $slots = [];
        $now = Carbon::now();
        $isToday = $date->isToday();

        foreach ($schedules as $schedule) {
            $slotDuration = $schedule->slot_duration_minutes ?: 30;
            $start = Carbon::parse($date->toDateString() . ' ' . $schedule->start_time);
            $end = Carbon::parse($date->toDateString() . ' ' . $schedule->end_time);

            while ($start->copy()->addMinutes($slotDuration)->lte($end)) {
                $slotStart = $start->format('H:i');
                $slotEnd = $start->copy()->addMinutes($slotDuration)->format('H:i');

                $isBooked = in_array($slotStart, $bookedSlots);
                $isPast = $isToday && $start->lt($now);
                $isAvailable = !$isBooked && !$isPast;

                $slots[] = [
                    'schedule_id' => $schedule->id,
                    'start_time' => $slotStart,
                    'end_time' => $slotEnd,
                    'formatted_label' => "{$slotStart} - {$slotEnd}",
                    'is_available' => $isAvailable,
                    'is_booked' => $isBooked,
                    'is_past' => $isPast,
                ];

                $start->addMinutes($slotDuration);
            }
        }

        return [
            'doctor_id' => $doctorId,
            'date' => $date->toDateString(),
            'day' => $dayOfWeek,
            'is_open' => true,
            'total_slots' => count($slots),
            'available_slots_count' => count(array_filter($slots, fn($s) => $s['is_available'])),
            'slots' => $slots,
        ];
    }
}
