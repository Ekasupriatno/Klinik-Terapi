<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BookingStoreRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct(
        protected BookingService $bookingService
    ) {}

    /**
     * Mengambil daftar booking
     * Pasien: booking milik sendiri
     * Admin: seluruh booking klinik dengan filter status/tanggal
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Booking::with(['doctor.specialization', 'user', 'review']);

        if (!$user->isAdmin()) {
            $query->where('user_id', $user->id);
        } else {
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }
            if ($request->filled('date')) {
                $query->where('appointment_date', $request->date);
            }
            if ($request->filled('doctor_id')) {
                $query->where('doctor_id', $request->doctor_id);
            }
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('booking_code', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($uq) use ($search) {
                          $uq->where('name', 'like', "%{$search}%");
                      });
                });
            }
        }

        $bookings = $query->orderBy('appointment_date', 'desc')
                          ->orderBy('appointment_time', 'desc')
                          ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => BookingResource::collection($bookings),
            'meta' => [
                'current_page' => $bookings->currentPage(),
                'last_page' => $bookings->lastPage(),
                'total' => $bookings->total(),
            ],
        ]);
    }

    /**
     * Buat appointment baru (Atomic Zero Double-Booking)
     */
    public function store(BookingStoreRequest $request): JsonResponse
    {
        $booking = $this->bookingService->createBooking(
            $request->user(),
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Reservasi appointment berhasil dibuat! Mohon menunggu konfirmasi klinik.',
            'data' => new BookingResource($booking->load(['doctor.specialization', 'user'])),
        ], 201);
    }

    /**
     * Detail booking tertentu
     */
    public function show(Request $request, Booking $booking): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin() && $booking->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke booking ini.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => new BookingResource($booking->load(['doctor.specialization', 'user', 'review'])),
        ]);
    }

    /**
     * Batalkan booking
     */
    public function cancel(Request $request, Booking $booking): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $cancelledBooking = $this->bookingService->cancelBooking(
            $booking,
            $request->user(),
            $validated['reason'] ?? null
        );

        return response()->json([
            'success' => true,
            'message' => 'Booking berhasil dibatalkan.',
            'data' => new BookingResource($cancelledBooking),
        ]);
    }

    /**
     * Update status booking (Khusus Admin)
     */
    public function updateStatus(Request $request, Booking $booking): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,confirmed,in_consultation,completed,cancelled,no_show'],
            'doctor_notes' => ['nullable', 'string'],
        ]);

        $updated = $this->bookingService->updateStatus(
            $booking,
            $validated['status'],
            $validated['doctor_notes'] ?? null
        );

        return response()->json([
            'success' => true,
            'message' => "Status booking berhasil diubah menjadi '{$validated['status']}'.",
            'data' => new BookingResource($updated->load(['doctor.specialization', 'user'])),
        ]);
    }
}
