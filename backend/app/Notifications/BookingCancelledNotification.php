<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BookingCancelledNotification extends Notification
{
    use Queueable;

    public function __construct(private Booking $booking, private string $actorRole) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $booking = $this->booking->loadMissing(['user', 'patient', 'doctor']);
        $patientName = $booking->patient?->name ?? $booking->user?->name ?? 'Pasien';

        return [
            'type' => 'booking_cancelled',
            'title' => 'Reservasi Dibatalkan',
            'message' => "Reservasi {$booking->booking_code} ({$patientName}) telah dibatalkan oleh " . ($this->actorRole === 'admin' ? 'Admin' : 'Pasien') . ".",
            'booking_id' => $booking->id,
            'booking_code' => $booking->booking_code,
            'patient_name' => $patientName,
            'cancel_reason' => $booking->cancel_reason,
            'appointment_date' => $booking->appointment_date?->toDateString(),
            'appointment_time' => substr($booking->appointment_time ?? '00:00', 0, 5),
        ];
    }
}
