<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class BookingStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'message' => $validator->errors()->first(),
            'errors' => $validator->errors(),
        ], 422));
    }

    public function rules(): array
    {
        return [
            'doctor_id' => ['required', 'exists:doctors,id'],
            'service_id' => ['required', 'exists:services,id'],
            'child_id' => ['nullable', 'exists:children,id'],
            'schedule_id' => ['nullable', 'exists:schedules,id'],
            'appointment_date' => ['required', 'date', 'after_or_equal:today'],
            'appointment_time' => ['required', 'date_format:H:i'],
            'patient_complaint' => ['required', 'string', 'min:10', 'max:1000'],
            'phone' => ['required', 'string', 'min:10', 'max:15', 'regex:/^(\+62|62|0)8[1-9][0-9]{6,11}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'appointment_date.after_or_equal' => 'Tanggal appointment tidak boleh tanggal yang sudah lewat.',
            'patient_complaint.min' => 'Mohon jelaskan keluhan Anda minimal 10 karakter agar dokter dapat memahami kondisi Anda.',
            'phone.required' => 'Nomor telepon wajib diisi.',
            'phone.min' => 'Nomor telepon minimal 10 digit.',
            'phone.max' => 'Nomor telepon maksimal 15 karakter.',
            'phone.regex' => 'Format nomor telepon tidak valid. Gunakan format Indonesia: 08xxxxxxxx atau +628xxxxxxxx',
        ];
    }
}
