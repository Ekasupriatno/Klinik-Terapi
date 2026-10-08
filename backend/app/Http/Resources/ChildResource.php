<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChildResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'guardian_id' => $this->guardian_id,
            'name' => $this->name,
            'birth_date' => $this->birth_date,
            'age' => $this->age,
            'gender' => $this->gender,
            'status' => $this->status,
            'medical_history' => $this->medical_history,
            'allergies' => $this->allergies,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
