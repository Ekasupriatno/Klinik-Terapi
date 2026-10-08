<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Http\Resources\SessionNoteResource;
use App\Models\Booking;
use App\Models\Doctor;
use App\Models\SessionNote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TherapistController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $doctorId = $this->doctorId($request);

        $today = now()->startOfDay();

        // Today's appointments
        $todayAppointments = Booking::where('doctor_id', $doctorId)
            ->where('appointment_date', $today)
            ->with('child', 'service')
            ->get();

        // Today's completed sessions
        $completedToday = Booking::where('doctor_id', $doctorId)
            ->where('appointment_date', $today)
            ->where('status', 'completed')
            ->count();

        // Upcoming appointments
        $upcomingAppointments = Booking::where('doctor_id', $doctorId)
            ->where('appointment_date', '>=', $today)
            ->where('status', 'confirmed')
            ->with('child', 'service')
            ->orderBy('appointment_date')
            ->orderBy('appointment_time')
            ->limit(10)
            ->get();

        // Pending session notes
        $pendingNotes = SessionNote::where('therapist_id', $doctorId)
            ->where('status', 'draft')
            ->with('booking.child')
            ->count();

        // Total patients assigned
        $totalPatients = Booking::where('doctor_id', $doctorId)
            ->distinct('child_id')
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'today_appointments' => BookingResource::collection($todayAppointments),
                'completed_today' => $completedToday,
                'upcoming_appointments' => BookingResource::collection($upcomingAppointments),
                'pending_session_notes' => $pendingNotes,
                'total_patients' => $totalPatients,
            ],
        ]);
    }

    public function patients(Request $request): AnonymousResourceCollection
    {
        $doctorId = $this->doctorId($request);

        $query = Booking::where('doctor_id', $doctorId)
            ->with('child.guardian.user', 'service')
            ->distinct('child_id');

        if ($request->search) {
            $query->whereHas('child', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            });
        }

        return BookingResource::collection($query->paginate(20));
    }

    public function sessionNotes(Request $request): AnonymousResourceCollection
    {
        $doctorId = $this->doctorId($request);

        $query = SessionNote::where('therapist_id', $doctorId)
            ->with('booking.child', 'therapist');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return SessionNoteResource::collection($query->orderBy('created_at', 'desc')->paginate(20));
    }

    public function calendar(Request $request): JsonResponse
    {
        $doctorId = $this->doctorId($request);
        $startDate = $request->start_date ?? now()->startOfMonth();
        $endDate = $request->end_date ?? now()->endOfMonth();

        $appointments = Booking::where('doctor_id', $doctorId)
            ->whereBetween('appointment_date', [$startDate, $endDate])
            ->with('child', 'service')
            ->orderBy('appointment_date')
            ->orderBy('appointment_time')
            ->get();

        return response()->json([
            'success' => true,
            'data' => BookingResource::collection($appointments),
        ]);
    }

    private function doctorId(Request $request): int
    {
        $doctorId = Doctor::where('user_id', $request->user()->id)->value('id');

        abort_unless($doctorId, 403, 'Akun dokter Anda belum ditautkan oleh admin.');

        return (int) $doctorId;
    }
}
