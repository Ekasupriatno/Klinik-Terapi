<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'min:10', 'max:15', 'regex:/^(\+62|62|0)8[1-9][0-9]{6,11}$/'],
            'role' => ['sometimes', 'string', 'in:patient,doctor'],
            // 6+ karakter dengan empat kelompok karakter mengurangi risiko
            // kata sandi mudah ditebak tanpa membatasi penggunaan passphrase.
            'password' => [
                'required',
                'string',
                'max:128',
                'confirmed',
                Password::min(6)->mixedCase()->numbers()->symbols(),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'Email ini sudah terdaftar. Silakan gunakan email lain atau login.',
            'role.in' => 'Pilih jenis akun pasien atau dokter.',
            'phone.min' => 'Nomor telepon minimal 10 digit.',
            'phone.max' => 'Nomor telepon maksimal 15 karakter.',
            'phone.regex' => 'Format nomor telepon tidak valid. Gunakan format Indonesia: 08xxxxxxxx atau +628xxxxxxxx',
            'password.min' => 'Kata sandi minimal 6 karakter.',
            'password.mixed' => 'Kata sandi harus memuat huruf besar dan huruf kecil.',
            'password.numbers' => 'Kata sandi harus memuat setidaknya satu angka.',
            'password.symbols' => 'Kata sandi harus memuat setidaknya satu simbol.',
            'password.max' => 'Kata sandi tidak boleh lebih dari 128 karakter.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
        ];
    }
}
