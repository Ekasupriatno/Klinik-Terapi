<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BookingStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'doctor_id' => ['required', 'exists:doctors,id'],
            'schedule_id' => ['nullable', 'exists:schedules,id'],
            'appointment_date' => ['required', 'date', 'after_or_equal:today'],
            'appointment_time' => ['required', 'date_format:H:i'],
            'patient_complaint' => ['required', 'string', 'min:10', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'appointment_date.after_or_equal' => 'Tanggal appointment tidak boleh tanggal yang sudah lewat.',
            'patient_complaint.min' => 'Mohon jelaskan keluhan Anda minimal 10 karakter agar dokter dapat memahami kondisi Anda.',
        ];
    }
}
