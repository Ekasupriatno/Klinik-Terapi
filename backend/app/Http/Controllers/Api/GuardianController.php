<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\GuardianResource;
use App\Models\Guardian;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class GuardianController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Guardian::with('user', 'patients');

        if ($request->search) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        return GuardianResource::collection($query->paginate(20));
    }

    public function me(Request $request): GuardianResource
    {
        $guardian = $request->user()->guardian;
        if (!$guardian) {
            $guardian = Guardian::create([
                'user_id' => $request->user()->id,
                'phone' => $request->user()->phone ?? '',
                'relationship_to_patient' => 'parent',
            ]);
        }
        $guardian->load('user', 'patients');
        return new GuardianResource($guardian);
    }

    public function updateMe(Request $request): JsonResponse
    {
        $guardian = $request->user()->guardian;
        if (!$guardian) {
            $guardian = Guardian::create([
                'user_id' => $request->user()->id,
                'phone' => $request->user()->phone ?? '',
                'relationship_to_patient' => 'parent',
            ]);
        }
        return $this->update($request, $guardian);
    }

    public function show(Guardian $guardian): GuardianResource
    {
        $guardian->load('user', 'patients');
        return new GuardianResource($guardian);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'phone' => 'required|string|max:20',
            'address' => 'nullable|string',
            'emergency_contact' => 'nullable|string|max:255',
            'emergency_phone' => 'nullable|string|max:20',
            'relationship_to_patient' => 'nullable|string',
        ]);

        $validated['relationship_to_patient'] = $request->input('relationship_to_patient', 'parent');

        $guardian = Guardian::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data guardian berhasil dibuat.',
            'data' => new GuardianResource($guardian->load('user', 'patients')),
        ], 201);
    }

    public function update(Request $request, Guardian $guardian): JsonResponse
    {
        $validated = $request->validate([
            'phone' => 'sometimes|string|max:20',
            'address' => 'nullable|string',
            'emergency_contact' => 'nullable|string|max:255',
            'emergency_phone' => 'nullable|string|max:20',
            'relationship_to_patient' => 'sometimes|string',
        ]);

        if ($request->has('relationship_to_patient')) {
            $validated['relationship_to_patient'] = $request->input('relationship_to_patient');
        }

        $guardian->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data guardian berhasil diperbarui.',
            'data' => new GuardianResource($guardian->load('user')),
        ]);
    }

    public function destroy(Guardian $guardian): JsonResponse
    {
        $guardian->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data guardian berhasil dihapus.',
        ]);
    }
}
