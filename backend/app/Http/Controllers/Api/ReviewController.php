<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Booking;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ReviewController extends Controller
{
    /**
     * Berikan ulasan / rating untuk booking yang telah selesai
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'booking_id' => ['required', 'exists:bookings,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $booking = Booking::findOrFail($validated['booking_id']);
        $user = $request->user();

        if ($booking->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda hanya dapat memberikan ulasan untuk booking Anda sendiri.',
            ], 403);
        }

        if ($booking->status !== 'completed') {
            throw ValidationException::withMessages([
                'booking_id' => ['Ulasan hanya dapat diberikan setelah sesi konsultasi selesai (status completed).'],
            ]);
        }

        if ($booking->review()->exists()) {
            throw ValidationException::withMessages([
                'booking_id' => ['Anda sudah memberikan ulasan untuk booking ini.'],
            ]);
        }

        $review = Review::create([
            'booking_id' => $booking->id,
            'user_id' => $user->id,
            'doctor_id' => $booking->doctor_id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Terima kasih! Ulasan Anda telah tersimpan.',
            'data' => new ReviewResource($review->load('user')),
        ], 201);
    }
}
