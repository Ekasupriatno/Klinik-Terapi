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
            'user_id' => [
                'nullable',
                'exists:users,id',
                Rule::unique('doctors', 'user_id')->ignore($doctorId),
                function ($attribute, $value, $fail) {
                    if ($value && !\App\Models\User::whereKey($value)->where('role', 'therapist')->exists()) {
                        $fail('Akun yang dipilih harus memiliki role dokter/terapis.');
                    }
                },
            ],
            'specialization_id' => ['required', 'exists:specializations,id'],
            'name' => ['required', 'string', 'max:255'],
            'sip_number' => ['required', 'string', Rule::unique('doctors', 'sip_number')->ignore($doctorId)],
            'title' => ['nullable', 'string', 'max:100'],
            'experience_years' => ['required', 'integer', 'min:0', 'max:60'],
            'consultation_fee' => ['required', 'numeric', 'min:0'],
            'bio' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
