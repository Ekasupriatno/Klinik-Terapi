<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Doctor;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BookingWithPhoneTest extends TestCase
{
    use RefreshDatabase;

    public function test_booking_requires_phone_number(): void
    {
        Sanctum::actingAs($this->patient());
        
        $specialization = Specialization::create([
            'name' => 'Fisioterapi',
            'slug' => 'fisioterapi',
        ]);

        $doctor = Doctor::create([
            'specialization_id' => $specialization->id,
            'name' => 'dr. Test Doctor',
            'sip_number' => 'SIP/446/2026/009',
            'experience_years' => 5,
            'consultation_fee' => 200000,
            'is_active' => true,
        ]);

        $payload = [
            'doctor_id' => $doctor->id,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'appointment_time' => '09:00',
            'patient_complaint' => 'Nyeri punggung bawah sejak 2 minggu lalu.',
            // Missing phone field
        ];

        $this->postJson('/api/bookings', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['phone']);
    }

    public function test_booking_validation_message_does_not_include_more_errors_suffix(): void
    {
        Sanctum::actingAs($this->patient());

        $specialization = Specialization::create([
            'name' => 'Fisioterapi',
            'slug' => 'fisioterapi',
        ]);

        $doctor = Doctor::create([
            'specialization_id' => $specialization->id,
            'name' => 'dr. Test Doctor',
            'sip_number' => 'SIP/446/2026/010',
            'experience_years' => 5,
            'consultation_fee' => 200000,
            'is_active' => true,
        ]);

        $payload = [
            'doctor_id' => $doctor->id,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'appointment_time' => '09:00',
            'patient_complaint' => 'pendek',
        ];

        $response = $this->postJson('/api/bookings', $payload);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors(['phone', 'patient_complaint']);

        $this->assertStringNotContainsStringIgnoringCase(
            'and 1 more error',
            (string) $response->json('message')
        );
    }

    public function test_booking_with_valid_phone_number(): void
    {
        Sanctum::actingAs($this->patient());
        
        $specialization = Specialization::create([
            'name' => 'Fisioterapi',
            'slug' => 'fisioterapi',
        ]);

        $doctor = Doctor::create([
            'specialization_id' => $specialization->id,
            'name' => 'dr. Test Doctor',
            'sip_number' => 'SIP/446/2026/007',
            'experience_years' => 5,
            'consultation_fee' => 200000,
            'is_active' => true,
        ]);

        $payload = [
            'doctor_id' => $doctor->id,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'appointment_time' => '09:00',
            'patient_complaint' => 'Nyeri punggung bawah sejak 2 minggu lalu.',
            'phone' => '081234567890',
        ];

        $this->postJson('/api/bookings', $payload)
            ->assertCreated()
            ->assertJsonPath('data.phone', '081234567890');

        $this->assertDatabaseHas('bookings', [
            'phone' => '081234567890',
        ]);
    }

    public function test_booking_phone_validation_accepts_international_format(): void
    {
        Sanctum::actingAs($this->patient());
        
        $specialization = Specialization::create([
            'name' => 'Fisioterapi',
            'slug' => 'fisioterapi',
        ]);

        $doctor = Doctor::create([
            'specialization_id' => $specialization->id,
            'name' => 'dr. Test Doctor',
            'sip_number' => 'SIP/446/2026/008',
            'experience_years' => 5,
            'consultation_fee' => 200000,
            'is_active' => true,
        ]);

        $payload = [
            'doctor_id' => $doctor->id,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'appointment_time' => '09:00',
            'patient_complaint' => 'Nyeri punggung bawah sejak 2 minggu lalu.',
            'phone' => '+6281234567890',
        ];

        $this->postJson('/api/bookings', $payload)
            ->assertCreated()
            ->assertJsonPath('data.phone', '+6281234567890');
    }

    public function test_booking_phone_validation_accepts_local_format(): void
    {
        Sanctum::actingAs($this->patient());
        
        $specialization = Specialization::create([
            'name' => 'Fisioterapi',
            'slug' => 'fisioterapi',
        ]);

        $doctor = Doctor::create([
            'specialization_id' => $specialization->id,
            'name' => 'dr. Test Doctor',
            'sip_number' => 'SIP/446/2026/002',
            'experience_years' => 5,
            'consultation_fee' => 200000,
            'is_active' => true,
        ]);

        $payload = [
            'doctor_id' => $doctor->id,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'appointment_time' => '09:00',
            'patient_complaint' => 'Nyeri punggung bawah sejak 2 minggu lalu.',
            'phone' => '081234567890',
        ];

        $this->postJson('/api/bookings', $payload)
            ->assertCreated()
            ->assertJsonPath('data.phone', '081234567890');
    }

    public function test_booking_phone_validation_accepts_62_format(): void
    {
        Sanctum::actingAs($this->patient());
        
        $specialization = Specialization::create([
            'name' => 'Fisioterapi',
            'slug' => 'fisioterapi',
        ]);

        $doctor = Doctor::create([
            'specialization_id' => $specialization->id,
            'name' => 'dr. Test Doctor',
            'sip_number' => 'SIP/446/2026/003',
            'experience_years' => 5,
            'consultation_fee' => 200000,
            'is_active' => true,
        ]);

        $payload = [
            'doctor_id' => $doctor->id,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'appointment_time' => '09:00',
            'patient_complaint' => 'Nyeri punggung bawah sejak 2 minggu lalu.',
            'phone' => '6281234567890',
        ];

        $this->postJson('/api/bookings', $payload)
            ->assertCreated()
            ->assertJsonPath('data.phone', '6281234567890');
    }

    public function test_booking_phone_validation_rejects_invalid_format(): void
    {
        Sanctum::actingAs($this->patient());
        
        $specialization = Specialization::create([
            'name' => 'Fisioterapi',
            'slug' => 'fisioterapi',
        ]);

        $doctor = Doctor::create([
            'specialization_id' => $specialization->id,
            'name' => 'dr. Test Doctor',
            'sip_number' => 'SIP/446/2026/004',
            'experience_years' => 5,
            'consultation_fee' => 200000,
            'is_active' => true,
        ]);

        $payload = [
            'doctor_id' => $doctor->id,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'appointment_time' => '09:00',
            'patient_complaint' => 'Nyeri punggung bawah sejak 2 minggu lalu.',
            'phone' => 'abc123', // Invalid format
        ];

        $this->postJson('/api/bookings', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['phone']);
    }

    public function test_booking_phone_validation_rejects_non_indonesian_format(): void
    {
        Sanctum::actingAs($this->patient());
        
        $specialization = Specialization::create([
            'name' => 'Fisioterapi',
            'slug' => 'fisioterapi',
        ]);

        $doctor = Doctor::create([
            'specialization_id' => $specialization->id,
            'name' => 'dr. Test Doctor',
            'sip_number' => 'SIP/446/2026/005',
            'experience_years' => 5,
            'consultation_fee' => 200000,
            'is_active' => true,
        ]);

        $payload = [
            'doctor_id' => $doctor->id,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'appointment_time' => '09:00',
            'patient_complaint' => 'Nyeri punggung bawah sejak 2 minggu lalu.',
            'phone' => '+1234567890', // Non-Indonesian format
        ];

        $this->postJson('/api/bookings', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['phone']);
    }

    public function test_booking_phone_validation_rejects_landline_format(): void
    {
        Sanctum::actingAs($this->patient());
        
        $specialization = Specialization::create([
            'name' => 'Fisioterapi',
            'slug' => 'fisioterapi',
        ]);

        $doctor = Doctor::create([
            'specialization_id' => $specialization->id,
            'name' => 'dr. Test Doctor',
            'sip_number' => 'SIP/446/2026/006',
            'experience_years' => 5,
            'consultation_fee' => 200000,
            'is_active' => true,
        ]);

        $payload = [
            'doctor_id' => $doctor->id,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'appointment_time' => '09:00',
            'patient_complaint' => 'Nyeri punggung bawah sejak 2 minggu lalu.',
            'phone' => '02112345678', // Landline format
        ];

        $this->postJson('/api/bookings', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['phone']);
    }

    private function patient(): User
    {
        return User::create([
            'name' => 'Pasien Test',
            'email' => 'pasien@example.test',
            'password' => Hash::make('KataSandiAman!123'),
            'role' => 'patient',
        ]);
    }
}
