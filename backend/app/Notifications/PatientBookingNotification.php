<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PatientBookingNotification extends Notification
{
    use Queueable;

    public function __construct(private Booking $booking) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $booking = $this->booking->loadMissing(['user', 'child', 'doctor', 'service']);
        $patientName = $booking->child?->name ?? $booking->user?->name ?? 'Pasien';

        return [
            'type' => 'patient_booking_created',
            'title' => 'Reservasi pasien baru',
            'message' => "{$patientName} membuat reservasi untuk Anda.",
            'booking_id' => $booking->id,
            'booking_code' => $booking->booking_code,
            'patient_name' => $patientName,
            'service_name' => $booking->service?->name,
            'appointment_date' => $booking->appointment_date->toDateString(),
            'appointment_time' => substr($booking->appointment_time, 0, 5),
        ];
    }
}
