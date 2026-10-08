<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ChildResource;
use App\Models\Child;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ChildController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Child::with('guardian.user');

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

        return ChildResource::collection($query->paginate(20));
    }

    public function show(Child $child): ChildResource
    {
        $child->load('guardian.user', 'bookings.doctor', 'bookings.service');
        return new ChildResource($child);
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

        $child = Child::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data anak berhasil dibuat.',
            'data' => new ChildResource($child->load('guardian.user')),
        ], 201);
    }

    public function update(Request $request, Child $child): JsonResponse
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

        $child->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data anak berhasil diperbarui.',
            'data' => new ChildResource($child->load('guardian.user')),
        ]);
    }

    public function destroy(Child $child): JsonResponse
    {
        $child->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data anak berhasil dihapus.',
        ]);
    }
}
