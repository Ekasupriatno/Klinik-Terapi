<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DoctorRequest;
use App\Http\Resources\DoctorResource;
use App\Jobs\ProcessDoctorImageJob;
use App\Models\Doctor;
use App\Models\User;
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
        $doctors = $this->doctorQuery($request)->active()->latest()->get();

        return response()->json([
            'success' => true,
            'data' => DoctorResource::collection($doctors),
        ]);
    }

    /**
     * Daftar lengkap dokter, termasuk yang nonaktif. Hanya untuk dashboard admin.
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = $this->doctorQuery($request)->with('user');

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        return response()->json([
            'success' => true,
            'data' => DoctorResource::collection($query->latest()->get()),
        ]);
    }

    public function therapistAccounts(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => User::where('role', 'therapist')
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
        ]);
    }

    /**
     * Detail dokter tertentu beserta ulasan dan jadwal
     */
    public function show(Doctor $doctor): JsonResponse
    {
        if (!$doctor->is_active) {
            abort(404);
        }

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
        $data = $request->validated();

        if ($request->hasFile('image')) {
            // Store the uploaded image temporarily
            $imagePath = $request->file('image')->store('doctors/temp', 'public');
            $data['image_url'] = asset('storage/' . $imagePath);
        }

        $data['status'] = $data['status'] ?? 'approved';
        $doctor = Doctor::create($data);

        // Dispatch image processing job if image was uploaded
        if ($request->hasFile('image')) {
            ProcessDoctorImageJob::dispatch($doctor->id, $imagePath, true);
        }

        return response()->json([
            'success' => true,
            'message' => 'Data dokter berhasil ditambahkan.',
            'data' => new DoctorResource($doctor->fresh('specialization')),
        ], 201);
    }

    /**
     * Update data dokter (Admin)
     */
    public function update(DoctorRequest $request, Doctor $doctor): JsonResponse
    {
        $data = $request->validated();
        $oldImagePaths = [];

        if ($request->hasFile('image')) {
            $oldImagePaths = array_values(array_unique(array_filter([
                $this->publicStoragePath($doctor->image_url),
                $this->publicStoragePath($doctor->image_thumbnail_url),
                $this->publicStoragePath($doctor->image_medium_url),
            ])));

            $imagePath = $request->file('image')->store('doctors/temp', 'public');
            $data['image_url'] = asset('storage/' . $imagePath);
        }

        $doctor->update($data);

        // Dispatch image processing job if image was uploaded
        if ($request->hasFile('image')) {
            ProcessDoctorImageJob::dispatch($doctor->id, $imagePath, true, $oldImagePaths);
        }

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

    private function doctorQuery(Request $request)
    {
        $query = Doctor::with(['specialization', 'schedules' => function ($q) {
            $q->where('is_active', true);
        }]);

        if ($request->filled('specialization_id')) {
            $query->where('specialization_id', $request->specialization_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%");
            });
        }

        return $query;
    }

    private function publicStoragePath(?string $url): ?string
    {
        if (!$url) {
            return null;
        }

        $path = parse_url($url, PHP_URL_PATH);
        $storagePrefix = '/storage/';
        $storagePosition = is_string($path) ? strpos($path, $storagePrefix) : false;

        if ($storagePosition === false) {
            return null;
        }

        $storagePath = substr($path, $storagePosition + strlen($storagePrefix));

        return str_starts_with($storagePath, 'doctors/') ? $storagePath : null;
    }
}
