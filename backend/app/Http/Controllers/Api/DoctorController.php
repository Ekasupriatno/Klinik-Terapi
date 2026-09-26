<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DoctorRequest;
use App\Http\Resources\DoctorResource;
use App\Models\Doctor;
use App\Services\SlotEngineService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    public function __construct(
        protected SlotEngineService $slotEngine
    ) {}

    /**
     * Menampilkan daftar dokter dengan pencarian & filter spesialisasi
     */
    public function index(Request $request): JsonResponse
    {
        $query = Doctor::with(['specialization', 'schedules' => function ($q) {
            $q->where('is_active', true);
        }]);

        // Filter aktif (default hanya tampilkan aktif untuk publik)
        if (!$request->user() || !$request->user()->isAdmin()) {
            $query->active();
        } elseif ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        // Filter spesialisasi
        if ($request->filled('specialization_id')) {
            $query->where('specialization_id', $request->specialization_id);
        }

        // Pencarian nama dokter / gelar
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%");
            });
        }

        $doctors = $query->latest()->get();

        return response()->json([
            'success' => true,
            'data' => DoctorResource::collection($doctors),
        ]);
    }

    /**
     * Detail dokter tertentu beserta ulasan dan jadwal
     */
    public function show(Doctor $doctor): JsonResponse
    {
        $doctor->load(['specialization', 'schedules' => function ($q) {
            $q->where('is_active', true);
        }, 'reviews.user']);

        return response()->json([
            'success' => true,
            'data' => new DoctorResource($doctor),
        ]);
    }

    /**
     * Ambil slot waktu yang tersedia untuk tanggal tertentu
     */
    public function availableSlots(Request $request, Doctor $doctor): JsonResponse
    {
        $request->validate([
            'date' => ['required', 'date', 'after_or_equal:today'],
        ]);

        $slotsData = $this->slotEngine->getAvailableSlots($doctor->id, $request->date);

        return response()->json([
            'success' => true,
            'data' => $slotsData,
        ]);
    }

    /**
     * Tambah data dokter baru (Admin)
     */
    public function store(DoctorRequest $request): JsonResponse
    {
        $doctor = Doctor::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Data dokter berhasil ditambahkan.',
            'data' => new DoctorResource($doctor->load('specialization')),
        ], 201);
    }

    /**
     * Update data dokter (Admin)
     */
    public function update(DoctorRequest $request, Doctor $doctor): JsonResponse
    {
        $doctor->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Data dokter berhasil diperbarui.',
            'data' => new DoctorResource($doctor->fresh(['specialization', 'schedules'])),
        ]);
    }

    /**
     * Hapus dokter (Soft Delete - Admin)
     */
    public function destroy(Doctor $doctor): JsonResponse
    {
        $doctor->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data dokter berhasil dinonaktifkan/dihapus.',
        ]);
    }
}
