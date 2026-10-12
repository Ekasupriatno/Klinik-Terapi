<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AdminNewBookingNotification extends Notification
{
    use Queueable;

    public function __construct(private Booking $booking) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $booking = $this->booking->loadMissing(['user', 'patient', 'doctor', 'service']);
        $patientName = $booking->patient?->name ?? $booking->user?->name ?? 'Pasien';

        return [
            'type' => 'admin_booking_created',
            'title' => 'Reservasi Baru Masuk',
            'message' => "Pasien {$patientName} membuat reservasi baru ({$booking->booking_code}) untuk {$booking->doctor?->name}.",
            'booking_id' => $booking->id,
            'booking_code' => $booking->booking_code,
            'patient_name' => $patientName,
            'doctor_name' => $booking->doctor?->name,
            'service_name' => $booking->service?->name,
            'appointment_date' => $booking->appointment_date?->toDateString(),
            'appointment_time' => substr($booking->appointment_time ?? '00:00', 0, 5),
        ];
    }
}
