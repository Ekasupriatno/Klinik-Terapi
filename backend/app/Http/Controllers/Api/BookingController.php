<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BookingStoreRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\Child;
use App\Models\Service;
use App\Models\User;
use App\Services\BookingService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

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
        $query = Booking::with(['doctor.specialization', 'user', 'child', 'service', 'review']);

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

    /**
     * Daftar pasien untuk dropdown admin
     */
    public function patients(): JsonResponse
    {
        $patients = User::where('role', 'patient')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'phone']);

        return response()->json([
            'success' => true,
            'data' => $patients,
        ]);
    }

    /**
     * Admin membuat reservasi baru (Walk-in / Manual)
     */
    public function adminStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['nullable', 'exists:users,id'],
            'child_id' => ['nullable', 'exists:children,id'],
            'patient_name' => ['required_without:user_id', 'nullable', 'string', 'max:255'],
            'patient_email' => ['nullable', 'email'],
            'phone' => ['required', 'string', 'max:20'],
            'doctor_id' => ['required', 'exists:doctors,id'],
            'service_id' => ['nullable', 'exists:services,id'],
            'schedule_id' => ['nullable', 'exists:schedules,id'],
            'appointment_date' => ['required', 'date'],
            'appointment_time' => ['required', 'string'],
            'end_time' => ['nullable', 'string'],
            'status' => ['nullable', 'in:pending,confirmed,in_consultation,completed,cancelled,no_show'],
            'patient_complaint' => ['required', 'string'],
            'doctor_notes' => ['nullable', 'string'],
        ]);

        // Cari atau buat user pasien jika user_id tidak dikirim
        $user = null;
        if (!empty($validated['user_id'])) {
            $user = User::findOrFail($validated['user_id']);
        } else {
            $cleanPhone = preg_replace('/[^0-9]/', '', $validated['phone']);
            $user = User::where('phone', $validated['phone'])
                ->orWhere('phone', $cleanPhone)
                ->first();

            if (!$user) {
                $email = !empty($validated['patient_email']) 
                    ? $validated['patient_email'] 
                    : 'pasien_' . time() . '_' . Str::random(4) . '@klinikterapi.local';

                $user = User::create([
                    'name' => $validated['patient_name'],
                    'phone' => $validated['phone'],
                    'email' => $email,
                    'password' => Hash::make(Str::random(16)),
                    'role' => 'patient',
                ]);
            }
        }

        $appointmentDate = Carbon::parse($validated['appointment_date'])->toDateString();
        $appointmentTime = Carbon::parse($validated['appointment_time'])->format('H:i:s');
        $endTime = !empty($validated['end_time'])
            ? Carbon::parse($validated['end_time'])->format('H:i:s')
            : Carbon::parse($appointmentTime)->addMinutes(30)->format('H:i:s');

        $uniqueCode = 'KT-' . Carbon::now()->format('Ym') . '-' . strtoupper(Str::random(5));
        $status = $validated['status'] ?? 'confirmed';

        $booking = Booking::create([
            'booking_code' => $uniqueCode,
            'user_id' => $user->id,
            'child_id' => $validated['child_id'] ?? null,
            'phone' => $validated['phone'],
            'doctor_id' => $validated['doctor_id'],
            'service_id' => $validated['service_id'] ?? null,
            'schedule_id' => $validated['schedule_id'] ?? null,
            'appointment_date' => $appointmentDate,
            'appointment_time' => $appointmentTime,
            'end_time' => $endTime,
            'status' => $status,
            'patient_complaint' => $validated['patient_complaint'],
            'doctor_notes' => $validated['doctor_notes'] ?? null,
            'confirmed_at' => $status === 'confirmed' ? Carbon::now() : null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Reservasi pasien berhasil dibuat.',
            'data' => new BookingResource($booking->load(['doctor.specialization', 'user'])),
        ], 201);
    }

    /**
     * Admin memperbarui seluruh detail reservasi
     */
    public function adminUpdate(Request $request, Booking $booking): JsonResponse
    {
        $validated = $request->validate([
            'child_id' => ['sometimes', 'nullable', 'exists:children,id'],
            'doctor_id' => ['sometimes', 'exists:doctors,id'],
            'service_id' => ['sometimes', 'nullable', 'exists:services,id'],
            'schedule_id' => ['nullable', 'exists:schedules,id'],
            'appointment_date' => ['sometimes', 'date'],
            'appointment_time' => ['sometimes', 'string'],
            'end_time' => ['nullable', 'string'],
            'phone' => ['sometimes', 'string', 'max:20'],
            'patient_complaint' => ['sometimes', 'string'],
            'status' => ['sometimes', 'in:pending,confirmed,in_consultation,completed,cancelled,no_show'],
            'doctor_notes' => ['nullable', 'string'],
            'cancel_reason' => ['nullable', 'string'],
        ]);

        $updates = [];
        if ($request->has('child_id')) $updates['child_id'] = $validated['child_id'];
        if ($request->has('doctor_id')) $updates['doctor_id'] = $validated['doctor_id'];
        if ($request->has('service_id')) $updates['service_id'] = $validated['service_id'];
        if ($request->has('schedule_id')) $updates['schedule_id'] = $validated['schedule_id'];
        if ($request->has('appointment_date')) $updates['appointment_date'] = Carbon::parse($validated['appointment_date'])->toDateString();
        
        if ($request->has('appointment_time')) {
            $appointmentTime = Carbon::parse($validated['appointment_time'])->format('H:i:s');
            $updates['appointment_time'] = $appointmentTime;
            if ($request->has('end_time') && !empty($validated['end_time'])) {
                $updates['end_time'] = Carbon::parse($validated['end_time'])->format('H:i:s');
            } else {
                $updates['end_time'] = Carbon::parse($appointmentTime)->addMinutes(30)->format('H:i:s');
            }
        } elseif ($request->has('end_time') && !empty($validated['end_time'])) {
            $updates['end_time'] = Carbon::parse($validated['end_time'])->format('H:i:s');
        }

        if ($request->has('phone')) $updates['phone'] = $validated['phone'];
        if ($request->has('patient_complaint')) $updates['patient_complaint'] = $validated['patient_complaint'];
        if ($request->has('doctor_notes')) $updates['doctor_notes'] = $validated['doctor_notes'];
        if ($request->has('cancel_reason')) $updates['cancel_reason'] = $validated['cancel_reason'];
        
        if ($request->has('status')) {
            $updates['status'] = $validated['status'];
            if ($validated['status'] === 'confirmed' && !$booking->confirmed_at) {
                $updates['confirmed_at'] = Carbon::now();
            }
        }

        $booking->update($updates);

        return response()->json([
            'success' => true,
            'message' => 'Data reservasi berhasil diperbarui.',
            'data' => new BookingResource($booking->fresh(['doctor.specialization', 'user', 'review'])),
        ]);
    }

    /**
     * Admin menghapus reservasi
     */
    public function destroy(Booking $booking): JsonResponse
    {
        $booking->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data reservasi pasien berhasil dihapus.',
        ]);
    }
}
