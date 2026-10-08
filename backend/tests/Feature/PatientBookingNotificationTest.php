<?php

namespace Tests\Feature;

use App\Models\Doctor;
use App\Models\Service;
use App\Models\Specialization;
use App\Models\User;
use App\Notifications\PatientBookingNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PatientBookingNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_patient_booking_notifies_the_assigned_therapist_account(): void
    {
        Notification::fake();

        $patient = $this->createUser('patient', 'patient@example.test');
        $therapist = $this->createUser('therapist', 'doctor@example.test');
        $specialization = Specialization::create([
            'name' => 'Fisioterapi',
            'slug' => 'fisioterapi',
        ]);
        $doctor = Doctor::create([
            'user_id' => $therapist->id,
            'specialization_id' => $specialization->id,
            'name' => 'dr. Dokter Tes',
            'sip_number' => 'SIP/446/2026/NOTIF',
            'experience_years' => 5,
            'consultation_fee' => 200000,
            'is_active' => true,
        ]);
        $service = Service::create([
            'specialization_id' => $specialization->id,
            'name' => 'Sesi Terapi Tes',
            'description' => 'Layanan untuk tes notifikasi.',
            'duration_minutes' => 60,
            'price' => 200000,
            'show_price' => true,
            'is_active' => true,
        ]);

        Sanctum::actingAs($patient);
        $response = $this->postJson('/api/bookings', [
            'doctor_id' => $doctor->id,
            'service_id' => $service->id,
            'appointment_date' => now()->addDay()->toDateString(),
            'appointment_time' => '09:00',
            'patient_complaint' => 'Keluhan pasien untuk tes notifikasi.',
            'phone' => '081234567890',
        ]);
        $response->assertCreated();
        $bookingId = $response->json('data.id');
        $bookingCode = $response->json('data.booking_code');

        Notification::assertSentTo(
            $therapist,
            PatientBookingNotification::class,
            function (PatientBookingNotification $notification, array $channels) use ($therapist, $bookingId, $bookingCode): bool {
                $data = $notification->toDatabase($therapist);

                return in_array('database', $channels, true)
                    && $data['booking_id'] === $bookingId
                    && $data['booking_code'] === $bookingCode
                    && $data['title'] === 'Reservasi pasien baru';
            }
        );
    }

    private function createUser(string $role, string $email): User
    {
        return User::create([
            'name' => ucfirst($role) . ' Tes',
            'email' => $email,
            'password' => Hash::make('KataSandiAman!123'),
            'role' => $role,
        ]);
    }
}
