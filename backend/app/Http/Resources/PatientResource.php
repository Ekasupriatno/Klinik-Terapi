<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PatientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'guardian_id' => $this->guardian_id,
            'name' => $this->name,
            'birth_date' => $this->birth_date ? ($this->birth_date instanceof \DateTimeInterface ? $this->birth_date->format('Y-m-d') : $this->birth_date) : null,
            'age' => $this->age,
            'gender' => $this->gender,
            'status' => $this->status,
            'medical_history' => $this->medical_history,
            'allergies' => $this->allergies,
            'notes' => $this->notes,
            'guardian' => GuardianResource::make($this->whenLoaded('guardian')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
