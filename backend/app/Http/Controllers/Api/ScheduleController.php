<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ScheduleResource;
use App\Models\Schedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    /**
     * Tampilkan jadwal untuk dokter tertentu
     */
    public function byDoctor(int $doctorId): JsonResponse
    {
        $schedules = Schedule::where('doctor_id', $doctorId)
            ->where('is_active', true)
            ->orderByRaw("FIELD(day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')")
            ->get();

        return response()->json([
            'success' => true,
            'data' => ScheduleResource::collection($schedules),
        ]);
    }

    /**
     * Tambah jadwal dokter (Admin)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'doctor_id' => ['required', 'exists:doctors,id'],
            'day_of_week' => ['required', 'in:monday,tuesday,wednesday,thursday,friday,saturday,sunday'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'slot_duration_minutes' => ['nullable', 'integer', 'min:15', 'max:120'],
            'max_quota_per_slot' => ['nullable', 'integer', 'min:1', 'max:10'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $schedule = Schedule::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Jadwal dokter berhasil ditambahkan.',
            'data' => new ScheduleResource($schedule),
        ], 201);
    }

    /**
     * Update jadwal dokter (Admin)
     */
    public function update(Request $request, Schedule $schedule): JsonResponse
    {
        $validated = $request->validate([
            'day_of_week' => ['sometimes', 'in:monday,tuesday,wednesday,thursday,friday,saturday,sunday'],
            'start_time' => ['sometimes', 'date_format:H:i'],
            'end_time' => ['sometimes', 'date_format:H:i', 'after:start_time'],
            'slot_duration_minutes' => ['sometimes', 'integer', 'min:15', 'max:120'],
            'max_quota_per_slot' => ['sometimes', 'integer', 'min:1', 'max:10'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $schedule->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Jadwal dokter berhasil diperbarui.',
            'data' => new ScheduleResource($schedule),
        ]);
    }

    /**
     * Hapus jadwal dokter (Admin)
     */
    public function destroy(Schedule $schedule): JsonResponse
    {
        $schedule->delete();

        return response()->json([
            'success' => true,
            'message' => 'Jadwal dokter berhasil dihapus.',
        ]);
    }
}
