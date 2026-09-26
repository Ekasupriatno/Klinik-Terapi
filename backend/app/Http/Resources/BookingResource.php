<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $statusLabels = [
            'pending' => 'Menunggu Konfirmasi',
            'confirmed' => 'Terkonfirmasi',
            'in_consultation' => 'Sedang Konsultasi',
            'completed' => 'Selesai',
            'cancelled' => 'Dibatalkan',
            'no_show' => 'Tidak Hadir',
        ];

        return [
            'id' => $this->id,
            'booking_code' => $this->booking_code,
            'appointment_date' => $this->appointment_date?->format('Y-m-d'),
            'formatted_date' => $this->appointment_date?->translatedFormat('d F Y') ?? $this->appointment_date?->format('d M Y'),
            'appointment_time' => substr($this->appointment_time, 0, 5),
            'end_time' => substr($this->end_time, 0, 5),
            'time_range' => substr($this->appointment_time, 0, 5) . ' - ' . substr($this->end_time, 0, 5),
            'status' => $this->status,
            'status_label' => $statusLabels[$this->status] ?? ucfirst($this->status),
            'patient_complaint' => $this->patient_complaint,
            'doctor_notes' => $this->doctor_notes,
            'cancel_reason' => $this->cancel_reason,
            'confirmed_at' => $this->confirmed_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'can_cancel' => $this->canBeCancelled(),
            'can_review' => $this->canBeReviewed(),
            'patient' => new UserResource($this->whenLoaded('user')),
            'doctor' => new DoctorResource($this->whenLoaded('doctor')),
            'review' => new ReviewResource($this->whenLoaded('review')),
        ];
    }
}
