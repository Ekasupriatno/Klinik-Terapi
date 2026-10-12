<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PatientResource;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PatientController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Patient::with('guardian.user');

        if ($request->guardian_id) {
            $query->where('guardian_id', $request->guardian_id);
        } elseif ($request->user() && $request->user()->isParent()) {
            $guardian = $request->user()->guardian;
            if ($guardian) {
                $query->where('guardian_id', $guardian->id);
            } else {
                $query->whereRaw('1 = 0');
            }
        }

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return PatientResource::collection($query->paginate(20));
    }

    public function show(Patient $patient): PatientResource
    {
        $patient->load('guardian.user', 'bookings.doctor', 'bookings.service');
        return new PatientResource($patient);
    }

    public function store(Request $request): JsonResponse
    {
        if (!$request->has('guardian_id') && $request->user() && $request->user()->guardian) {
            $request->merge(['guardian_id' => $request->user()->guardian->id]);
        }

        $validated = $request->validate([
            'guardian_id' => 'required|exists:guardians,id',
            'name' => 'required|string|max:255',
            'birth_date' => 'required|date',
            'gender' => 'required|in:male,female',
            'status' => 'sometimes|in:active,inactive,completed',
            'medical_history' => 'nullable|string',
            'allergies' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $patient = Patient::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data pasien berhasil dibuat.',
            'data' => new PatientResource($patient->load('guardian.user')),
        ], 201);
    }

    public function update(Request $request, Patient $patient): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'birth_date' => 'sometimes|date',
            'gender' => 'sometimes|in:male,female',
            'status' => 'sometimes|in:active,inactive,completed',
            'medical_history' => 'nullable|string',
            'allergies' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $patient->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data pasien berhasil diperbarui.',
            'data' => new PatientResource($patient->load('guardian.user')),
        ]);
    }

    public function destroy(Patient $patient): JsonResponse
    {
        $patient->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data pasien berhasil dihapus.',
        ]);
    }
}
