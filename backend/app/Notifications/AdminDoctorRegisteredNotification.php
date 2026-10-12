<?php

namespace App\Notifications;

use App\Models\Doctor;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AdminDoctorRegisteredNotification extends Notification
{
    use Queueable;

    public function __construct(private Doctor $doctor, private User $user) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'doctor_registered',
            'title' => 'Pendaftaran Dokter Baru',
            'message' => "Dokter {$this->doctor->name} telah mendaftar dan menunggu verifikasi admin.",
            'doctor_id' => $this->doctor->id,
            'doctor_name' => $this->doctor->name,
            'email' => $this->user->email,
            'specialization' => $this->doctor->specialization,
        ];
    }
}
