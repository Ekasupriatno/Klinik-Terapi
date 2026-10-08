<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SessionNoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'booking_id' => $this->booking_id,
            'booking' => BookingResource::make($this->whenLoaded('booking')),
            'therapist_id' => $this->therapist_id,
            'therapist' => DoctorResource::make($this->whenLoaded('therapist')),
            'note' => $this->note,
            'interventions' => $this->interventions,
            'observations' => $this->observations,
            'progress' => $this->progress,
            'next_plan' => $this->next_plan,
            'status' => $this->status,
            'share_with_guardian' => $this->share_with_guardian,
            'completed_at' => $this->completed_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
