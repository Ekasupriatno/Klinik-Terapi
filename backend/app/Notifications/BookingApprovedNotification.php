<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BookingApprovedNotification extends Notification
{
    use Queueable;

    public function __construct(private Booking $booking) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $booking = $this->booking->loadMissing('doctor');

        return [
            'type' => 'booking_approved',
            'title' => 'Reservasi disetujui',
            'message' => "Reservasi {$booking->booking_code} telah disetujui untuk {$booking->doctor->name}.",
            'booking_id' => $booking->id,
            'booking_code' => $booking->booking_code,
            'appointment_date' => $booking->appointment_date->toDateString(),
            'appointment_time' => substr($booking->appointment_time, 0, 5),
        ];
    }
}
