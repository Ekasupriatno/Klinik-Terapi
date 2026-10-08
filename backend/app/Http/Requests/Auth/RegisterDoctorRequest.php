<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterDoctorRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:3', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'max:128', 'confirmed'],
            'specialization' => ['required', 'string', 'min:2', 'max:255'],
            'license_number' => ['required', 'string', 'min:3', 'max:100', 'unique:doctors,license_number', 'unique:doctors,sip_number'],
            'phone' => ['required', 'string', 'min:8', 'max:20'],
            'gender' => ['required', 'string', 'in:male,female'],
            'birth_date' => ['required', 'date', 'before:today'],
            'address' => ['required', 'string', 'max:1000'],
            'education' => ['required', 'string', 'min:2', 'max:255'],
            'experience_years' => ['required', 'integer', 'min:0', 'max:60'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'profile_photo' => ['nullable', 'file', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ];
    }

    /**
     * Custom validation error messages.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama lengkap wajib diisi.',
            'name.min' => 'Nama lengkap minimal 3 karakter.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah terdaftar. Silakan gunakan email lain atau login.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.min' => 'Kata sandi minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
            'specialization.required' => 'Spesialisasi wajib diisi.',
            'license_number.required' => 'Nomor lisensi / SIP / STR wajib diisi.',
            'license_number.unique' => 'Nomor lisensi sudah terdaftar dalam sistem.',
            'phone.required' => 'Nomor telepon wajib diisi.',
            'gender.required' => 'Jenis kelamin wajib dipilih.',
            'gender.in' => 'Pilihan jenis kelamin tidak valid (male/female).',
            'birth_date.required' => 'Tanggal lahir wajib diisi.',
            'birth_date.date' => 'Format tanggal lahir tidak valid.',
            'birth_date.before' => 'Tanggal lahir harus sebelum hari ini.',
            'address.required' => 'Alamat tempat praktik / domisili wajib diisi.',
            'education.required' => 'Riwayat pendidikan wajib diisi.',
            'experience_years.required' => 'Pengalaman kerja wajib diisi.',
            'experience_years.integer' => 'Pengalaman kerja harus berupa bilangan bulat.',
            'experience_years.min' => 'Pengalaman kerja tidak boleh kurang dari 0.',
            'profile_photo.image' => 'Berkas foto profil harus berupa gambar.',
            'profile_photo.mimes' => 'Format foto profil yang diizinkan hanya JPG, JPEG, PNG, dan WebP.',
            'profile_photo.max' => 'Ukuran foto profil maksimal 2MB (2048 KB).',
        ];
    }
}
