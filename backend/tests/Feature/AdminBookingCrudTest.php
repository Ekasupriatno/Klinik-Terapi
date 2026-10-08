<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Doctor;
use App\Models\Specialization;
use App\Models\User;
use App\Notifications\BookingApprovedNotification;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminBookingCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function createAdmin(): User
    {
        return User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'phone' => '081234567890',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);
    }

    protected function createPatient(string $name = 'Pasien Test', string $phone = '0899998888'): User
    {
        return User::create([
            'name' => $name,
            'email' => strtolower(str_replace(' ', '', $name)) . '@test.com',
            'phone' => $phone,
            'password' => Hash::make('password123'),
            'role' => 'patient',
        ]);
    }

    protected function createDoctor(): Doctor
    {
        $spec = Specialization::create([
            'name' => 'Fisioterapi',
            'slug' => 'fisioterapi',
        ]);

        return Doctor::create([
            'specialization_id' => $spec->id,
            'name' => 'dr. Handoko, Sp.KFR',
            'sip_number' => 'SIP/999/2026',
            'title' => 'Sp.KFR',
            'experience_years' => 5,
            'consultation_fee' => 200000,
            'is_active' => true,
        ]);
    }

    public function test_admin_can_fetch_patients_list(): void
    {
        $admin = $this->createAdmin();
        $this->createPatient('Budi Santoso', '0811111111');
        $this->createPatient('Ani Wijaya', '0822222222');

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin/patients');
        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data');
    }

    public function test_admin_can_create_booking_for_existing_patient(): void
    {
        $admin = $this->createAdmin();
        $patient = $this->createPatient('Rian Pratama', '081345678901');
        $doctor = $this->createDoctor();

        Sanctum::actingAs($admin);

        $payload = [
            'user_id' => $patient->id,
            'phone' => '081345678901',
            'doctor_id' => $doctor->id,
            'appointment_date' => Carbon::tomorrow()->toDateString(),
            'appointment_time' => '10:00',
            'end_time' => '10:30',
            'status' => 'confirmed',
            'patient_complaint' => 'Nyeri leher tegang akibat posisi duduk lama.',
            'doctor_notes' => 'Disarankan pemeriksaan awal leher.',
        ];

        $response = $this->postJson('/api/admin/bookings', $payload);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'confirmed')
            ->assertJsonPath('data.patient.name', 'Rian Pratama')
            ->assertJsonPath('data.patient_complaint', 'Nyeri leher tegang akibat posisi duduk lama.');

        $this->assertDatabaseHas('bookings', [
            'user_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'phone' => '081345678901',
            'status' => 'confirmed',
        ]);
    }

    public function test_admin_can_create_booking_for_new_walk_in_patient(): void
    {
        $admin = $this->createAdmin();
        $doctor = $this->createDoctor();

        Sanctum::actingAs($admin);

        $payload = [
            'patient_name' => 'Siti WalkIn',
            'patient_email' => 'sitiwalkin@example.com',
            'phone' => '087778889999',
            'doctor_id' => $doctor->id,
            'appointment_date' => Carbon::tomorrow()->toDateString(),
            'appointment_time' => '14:00',
            'end_time' => '14:30',
            'status' => 'confirmed',
            'patient_complaint' => 'Cedera pergelangan tangan terkilir.',
        ];

        $response = $this->postJson('/api/admin/bookings', $payload);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.patient.name', 'Siti WalkIn');

        $this->assertDatabaseHas('users', [
            'name' => 'Siti WalkIn',
            'phone' => '087778889999',
            'role' => 'patient',
        ]);
    }

    public function test_admin_can_update_booking_details(): void
    {
        $admin = $this->createAdmin();
        $patient = $this->createPatient();
        $doctor = $this->createDoctor();

        $booking = Booking::create([
            'booking_code' => 'KT-TEST-001',
            'user_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'phone' => $patient->phone,
            'appointment_date' => Carbon::tomorrow()->toDateString(),
            'appointment_time' => '09:00:00',
            'end_time' => '09:30:00',
            'status' => 'pending',
            'patient_complaint' => 'Keluhan awal.',
        ]);

        Sanctum::actingAs($admin);

        $updatePayload = [
            'appointment_time' => '11:00',
            'end_time' => '11:30',
            'status' => 'confirmed',
            'patient_complaint' => 'Keluhan telah diperbarui oleh admin.',
            'doctor_notes' => 'Catatan dokter setelah konsultasi.',
        ];

        $response = $this->putJson("/api/admin/bookings/{$booking->id}", $updatePayload);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'confirmed')
            ->assertJsonPath('data.appointment_time', '11:00')
            ->assertJsonPath('data.patient_complaint', 'Keluhan telah diperbarui oleh admin.')
            ->assertJsonPath('data.doctor_notes', 'Catatan dokter setelah konsultasi.');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'confirmed',
            'patient_complaint' => 'Keluhan telah diperbarui oleh admin.',
        ]);
    }

    public function test_patient_receives_one_notification_when_admin_approves_booking(): void
    {
        $admin = $this->createAdmin();
        $patient = $this->createPatient();
        $doctor = $this->createDoctor();
        $booking = Booking::create([
            'booking_code' => 'KT-TEST-APPROVED',
            'user_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'phone' => $patient->phone,
            'appointment_date' => Carbon::tomorrow()->toDateString(),
            'appointment_time' => '09:00:00',
            'end_time' => '09:30:00',
            'status' => 'pending',
            'patient_complaint' => 'Keluhan pasien.',
        ]);

        Sanctum::actingAs($admin);
        $this->putJson("/api/admin/bookings/{$booking->id}/status", [
            'status' => 'confirmed',
        ])->assertOk();
        $this->putJson("/api/admin/bookings/{$booking->id}/status", [
            'status' => 'confirmed',
        ])->assertOk();

        $this->assertDatabaseCount('notifications', 1);
        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $patient->id,
            'notifiable_type' => User::class,
            'type' => BookingApprovedNotification::class,
        ]);

        Sanctum::actingAs($patient);
        $notifications = $this->getJson('/api/notifications');
        $notifications->assertOk()
            ->assertJsonPath('unread_count', 1)
            ->assertJsonPath('data.0.data.type', 'booking_approved')
            ->assertJsonPath('data.0.data.booking_code', $booking->booking_code);

        $notificationId = $notifications->json('data.0.id');
        $this->putJson("/api/notifications/{$notificationId}/read")->assertOk();
        $this->getJson('/api/notifications')->assertJsonPath('unread_count', 0);
    }

    public function test_admin_can_delete_booking(): void
    {
        $admin = $this->createAdmin();
        $patient = $this->createPatient();
        $doctor = $this->createDoctor();

        $booking = Booking::create([
            'booking_code' => 'KT-TEST-002',
            'user_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'phone' => $patient->phone,
            'appointment_date' => Carbon::tomorrow()->toDateString(),
            'appointment_time' => '09:00:00',
            'end_time' => '09:30:00',
            'status' => 'pending',
            'patient_complaint' => 'Keluhan yang akan dihapus.',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->deleteJson("/api/admin/bookings/{$booking->id}");

        $response->assertOk()
            ->assertJsonPath('success', true);

        $this->assertSoftDeleted('bookings', [
            'id' => $booking->id,
        ]);
    }

    public function test_patient_cannot_access_admin_booking_crud(): void
    {
        $patient = $this->createPatient();
        Sanctum::actingAs($patient);

        $this->getJson('/api/admin/patients')->assertForbidden();
        $this->postJson('/api/admin/bookings', [])->assertForbidden();
    }
}
