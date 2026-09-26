<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ScheduleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $dayNames = [
            'monday' => 'Senin',
            'tuesday' => 'Selasa',
            'wednesday' => 'Rabu',
            'thursday' => 'Kamis',
            'friday' => 'Jumat',
            'saturday' => 'Sabtu',
            'sunday' => 'Minggu',
        ];

        return [
            'id' => $this->id,
            'doctor_id' => $this->doctor_id,
            'day_of_week' => $this->day_of_week,
            'day_label' => $dayNames[$this->day_of_week] ?? ucfirst($this->day_of_week),
            'start_time' => substr($this->start_time, 0, 5),
            'end_time' => substr($this->end_time, 0, 5),
            'formatted_time' => substr($this->start_time, 0, 5) . ' - ' . substr($this->end_time, 0, 5),
            'slot_duration_minutes' => $this->slot_duration_minutes,
            'is_active' => (bool) $this->is_active,
        ];
    }
}
