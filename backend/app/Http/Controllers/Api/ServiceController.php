<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ServiceController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Service::with('specialization');

        if ($request->specialization_id) {
            $query->where('specialization_id', $request->specialization_id);
        }

        if ($request->is_active !== null) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        return ServiceResource::collection($query->paginate(20));
    }

    public function show(Service $service): ServiceResource
    {
        $service->load('specialization');
        return new ServiceResource($service);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'specialization_id' => 'required|exists:specializations,id',
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'duration_minutes' => 'required|integer|min:15',
            'price' => 'required|numeric|min:0',
            'age_target' => 'nullable|string|max:100',
            'benefits' => 'nullable|string',
            'show_price' => 'sometimes|boolean',
            'is_active' => 'sometimes|boolean',
        ]);

        $service = Service::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Layanan berhasil dibuat.',
            'data' => new ServiceResource($service->load('specialization')),
        ], 201);
    }

    public function update(Request $request, Service $service): JsonResponse
    {
        $validated = $request->validate([
            'specialization_id' => 'sometimes|exists:specializations,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'duration_minutes' => 'sometimes|integer|min:15',
            'price' => 'sometimes|numeric|min:0',
            'age_target' => 'nullable|string|max:100',
            'benefits' => 'nullable|string',
            'show_price' => 'sometimes|boolean',
            'is_active' => 'sometimes|boolean',
        ]);

        $service->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Layanan berhasil diperbarui.',
            'data' => new ServiceResource($service->load('specialization')),
        ]);
    }

    public function destroy(Service $service): JsonResponse
    {
        $service->delete();

        return response()->json([
            'success' => true,
            'message' => 'Layanan berhasil dihapus.',
        ]);
    }
}
