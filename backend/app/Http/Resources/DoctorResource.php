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
            'image_thumbnail_url' => $this->image_thumbnail_url,
            'image_medium_url' => $this->image_medium_url,
            'is_active' => $this->is_active,
            'status' => $this->status ?? 'pending',
            'license_number' => $this->license_number ?? $this->sip_number,
            'phone' => $this->phone,
            'gender' => $this->gender,
            'birth_date' => $this->birth_date?->format('Y-m-d'),
            'address' => $this->address,
            'education' => $this->education,
            'profile_photo_url' => $this->profile_photo_url ?? $this->image_url,
            'rejection_reason' => $this->rejection_reason,
            'average_rating' => $this->average_rating,
            'total_reviews' => $this->total_reviews,
            'user' => $this->whenLoaded('user', fn () => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'role' => $this->user->role,
                'status' => $this->user->status,
            ] : null),
            'therapist_account' => $this->when(
                $request->user()?->isAdmin(),
                fn () => $this->user ? [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                ] : null
            ),
            'specialization' => [
                'id' => $this->specialization_id ?? ($this->relationLoaded('specialization') ? $this->getRelation('specialization')?->id : $this->specialization()->first()?->id),
                'name' => ($this->relationLoaded('specialization') ? $this->getRelation('specialization')?->name : $this->specialization()->first()?->name) ?? ($this->attributes['specialization'] ?? null),
                'slug' => ($this->relationLoaded('specialization') ? $this->getRelation('specialization')?->slug : $this->specialization()->first()?->slug),
                'icon' => ($this->relationLoaded('specialization') ? $this->getRelation('specialization')?->icon : $this->specialization()->first()?->icon),
            ],
            'schedules' => ScheduleResource::collection($this->whenLoaded('schedules')),
        ];
    }
}
