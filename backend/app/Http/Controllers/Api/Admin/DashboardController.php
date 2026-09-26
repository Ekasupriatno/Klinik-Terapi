<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\Doctor;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Ringkasan statistik & metrik utama klinik untuk Admin
     */
    public function stats(): JsonResponse
    {
        $today = Carbon::today()->toDateString();

        $totalPatients = User::where('role', 'patient')->count();
        $totalDoctors = Doctor::active()->count();
        $totalBookings = Booking::count();
        $pendingBookings = Booking::where('status', 'pending')->count();
        $todayBookings = Booking::where('appointment_date', $today)->count();
        $completedBookings = Booking::where('status', 'completed')->count();

        // 5 booking terbaru
        $recentBookings = Booking::with(['doctor.specialization', 'user'])
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'metrics' => [
                    'total_patients' => $totalPatients,
                    'total_doctors' => $totalDoctors,
                    'total_bookings' => $totalBookings,
                    'pending_bookings' => $pendingBookings,
                    'today_bookings' => $todayBookings,
                    'completed_bookings' => $completedBookings,
                ],
                'recent_bookings' => BookingResource::collection($recentBookings),
            ],
        ]);
    }
}
