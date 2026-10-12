<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GuardianResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'user' => UserResource::make($this->whenLoaded('user')),
            'phone' => $this->phone,
            'address' => $this->address,
            'emergency_contact' => $this->emergency_contact,
            'emergency_phone' => $this->emergency_phone,
            'relationship_to_patient' => $this->relationship_to_patient,
            'patients' => PatientResource::collection($this->whenLoaded('patients')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
