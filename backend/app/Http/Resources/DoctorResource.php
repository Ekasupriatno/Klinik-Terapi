<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DoctorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'sip_number' => $this->sip_number,
            'title' => $this->title,
            'experience_years' => $this->experience_years,
            'consultation_fee' => (float) $this->consultation_fee,
            'formatted_fee' => 'Rp ' . number_format($this->consultation_fee, 0, ',', '.'),
            'bio' => $this->bio,
            'image_url' => $this->image_url,
            'is_active' => $this->is_active,
            'average_rating' => $this->average_rating,
            'total_reviews' => $this->total_reviews,
            'specialization' => [
                'id' => $this->specialization?->id,
                'name' => $this->specialization?->name,
                'slug' => $this->specialization?->slug,
                'icon' => $this->specialization?->icon,
            ],
            'schedules' => ScheduleResource::collection($this->whenLoaded('schedules')),
        ];
    }
}
