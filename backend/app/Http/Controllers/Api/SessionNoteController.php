<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SessionNoteResource;
use App\Models\Booking;
use App\Models\Doctor;
use App\Models\SessionNote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SessionNoteController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = SessionNote::with('booking.child', 'therapist');

        if ($request->therapist_id) {
            $query->where('therapist_id', $request->therapist_id);
        }

        if ($request->booking_id) {
            $query->where('booking_id', $request->booking_id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return SessionNoteResource::collection($query->paginate(20));
    }

    public function show(SessionNote $sessionNote): SessionNoteResource
    {
        $sessionNote->load('booking.child.guardian', 'therapist');
        return new SessionNoteResource($sessionNote);
    }

    public function store(Request $request): JsonResponse
    {
        $rules = [
            'booking_id' => 'required|exists:bookings,id',
            'note' => 'required|string',
            'interventions' => 'nullable|string',
            'observations' => 'nullable|string',
            'progress' => 'nullable|string',
            'next_plan' => 'nullable|string',
            'status' => 'sometimes|in:draft,completed',
            'share_with_guardian' => 'sometimes|boolean',
        ];

        if ($request->user()->isAdmin()) {
            $rules['therapist_id'] = 'required|exists:doctors,id';
        }

        $validated = $request->validate($rules);
        if ($request->user()->isTherapist()) {
            $doctor = Doctor::where('user_id', $request->user()->id)->first();
            abort_unless($doctor, 403, 'Akun dokter Anda belum ditautkan oleh admin.');
            Booking::whereKey($validated['booking_id'])
                ->where('doctor_id', $doctor->id)
                ->firstOrFail();
            $validated['therapist_id'] = $doctor->id;
        }

        $sessionNote = SessionNote::create($validated);

        if ($sessionNote->status === 'completed') {
            $sessionNote->update(['completed_at' => now()]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Catatan sesi berhasil dibuat.',
            'data' => new SessionNoteResource($sessionNote->load('booking', 'therapist')),
        ], 201);
    }

    public function update(Request $request, SessionNote $sessionNote): JsonResponse
    {
        if ($request->user()->isTherapist()) {
            $doctor = Doctor::where('user_id', $request->user()->id)->first();
            abort_unless($doctor, 403, 'Akun dokter Anda belum ditautkan oleh admin.');
            abort_unless((int) $sessionNote->therapist_id === $doctor->id, 403);
        }

        $validated = $request->validate([
            'note' => 'sometimes|string',
            'interventions' => 'nullable|string',
            'observations' => 'nullable|string',
            'progress' => 'nullable|string',
            'next_plan' => 'nullable|string',
            'status' => 'sometimes|in:draft,completed',
            'share_with_guardian' => 'sometimes|boolean',
        ]);

        $sessionNote->update($validated);

        if ($sessionNote->status === 'completed' && !$sessionNote->completed_at) {
            $sessionNote->update(['completed_at' => now()]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Catatan sesi berhasil diperbarui.',
            'data' => new SessionNoteResource($sessionNote->load('booking', 'therapist')),
        ]);
    }

    public function destroy(SessionNote $sessionNote): JsonResponse
    {
        $sessionNote->delete();

        return response()->json([
            'success' => true,
            'message' => 'Catatan sesi berhasil dihapus.',
        ]);
    }
}
