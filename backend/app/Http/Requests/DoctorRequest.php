<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DoctorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isAdmin();
    }

    public function rules(): array
    {
        $doctorId = $this->route('doctor') ? $this->route('doctor')->id ?? $this->route('doctor') : null;

        return [
            'specialization_id' => ['required', 'exists:specializations,id'],
            'name' => ['required', 'string', 'max:255'],
            'sip_number' => ['required', 'string', Rule::unique('doctors', 'sip_number')->ignore($doctorId)],
            'title' => ['nullable', 'string', 'max:100'],
            'experience_years' => ['required', 'integer', 'min:0', 'max:60'],
            'consultation_fee' => ['required', 'numeric', 'min:0'],
            'bio' => ['nullable', 'string'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
