<?php

namespace Tests\Feature;

use App\Models\Doctor;
use App\Models\Service;
use App\Models\Specialization;
use App\Models\User;
use App\Notifications\AdminDoctorRegisteredNotification;
use App\Notifications\AdminNewBookingNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function createAdmin(string $email = 'admin@test.com'): User
    {
        return User::create([
            'name' => 'Admin User',
            'email' => $email,
            'phone' => '081234567890',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);
    }

    protected function createPatient(string $email = 'patient@test.com'): User
    {
        return User::create([
            'name' => 'Pasien Test',
            'email' => $email,
            'phone' => '081234567891',
            'password' => Hash::make('password123'),
            'role' => 'patient',
        ]);
    }

    protected function createDoctor(): Doctor
    {
        $therapist = User::create([
            'name' => 'dr. Terapis Tes',
            'email' => 'therapist@test.com',
            'phone' => '081234567892',
            'password' => Hash::make('password123'),
            'role' => 'therapist',
        ]);

        $specialization = Specialization::create([
            'name' => 'Sensori Integrasi',
            'slug' => 'sensori-integrasi',
        ]);

        return Doctor::create([
            'user_id' => $therapist->id,
            'specialization_id' => $specialization->id,
            'name' => 'dr. Terapis Tes',
            'experience_years' => 4,
            'consultation_fee' => 150000,
            'status' => 'approved',
            'is_active' => true,
        ]);
    }

    protected function createService(int $specializationId): Service
    {
        return Service::create([
            'specialization_id' => $specializationId,
            'name' => 'Sensori Terapi',
            'description' => 'Deskripsi layanan',
            'duration_minutes' => 45,
            'price' => 150000,
            'show_price' => true,
            'is_active' => true,
        ]);
    }

    public function test_admin_receives_notification_when_new_booking_is_created(): void
    {
        $admin = $this->createAdmin();
        $patient = $this->createPatient();
        $doctor = $this->createDoctor();
        $service = $this->createService($doctor->specialization_id);

        Sanctum::actingAs($patient);
        $response = $this->postJson('/api/bookings', [
            'doctor_id' => $doctor->id,
            'service_id' => $service->id,
            'appointment_date' => now()->addDays(2)->toDateString(),
            'appointment_time' => '10:00',
            'patient_complaint' => 'Keluhan pasien sensori integrasi.',
            'phone' => '081234567891',
        ]);

        $response->assertCreated();

        // Check database notifications for admin
        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $admin->id,
            'notifiable_type' => User::class,
            'type' => AdminNewBookingNotification::class,
        ]);

        // Login as admin and fetch notifications
        Sanctum::actingAs($admin);
        $notifRes = $this->getJson('/api/notifications');
        $notifRes->assertOk();
        $this->assertEquals(1, $notifRes->json('unread_count'));
        $this->assertEquals('Reservasi Baru Masuk', $notifRes->json('data.0.data.title'));

        // Mark all as read
        $markRes = $this->putJson('/api/notifications/mark-all-read');
        $markRes->assertOk();

        // Check unread count is now 0
        $afterRes = $this->getJson('/api/notifications');
        $this->assertEquals(0, $afterRes->json('unread_count'));
    }

    public function test_admin_can_mark_single_notification_as_read(): void
    {
        $admin = $this->createAdmin();
        $patient = $this->createPatient();
        $doctor = $this->createDoctor();
        $service = $this->createService($doctor->specialization_id);

        Sanctum::actingAs($patient);
        $this->postJson('/api/bookings', [
            'doctor_id' => $doctor->id,
            'service_id' => $service->id,
            'appointment_date' => now()->addDays(2)->toDateString(),
            'appointment_time' => '11:00',
            'patient_complaint' => 'Keluhan terapi okupasi anak.',
            'phone' => '081234567891',
        ])->assertCreated();

        Sanctum::actingAs($admin);
        $notifRes = $this->getJson('/api/notifications');
        $notifId = $notifRes->json('data.0.id');

        $this->putJson("/api/notifications/{$notifId}/read")->assertOk();

        $checkRes = $this->getJson('/api/notifications');
        $this->assertEquals(0, $checkRes->json('unread_count'));
    }

    public function test_user_can_delete_single_notification(): void
    {
        $admin = $this->createAdmin();
        $patient = $this->createPatient();
        $doctor = $this->createDoctor();
        $service = $this->createService($doctor->specialization_id);

        Sanctum::actingAs($patient);
        $this->postJson('/api/bookings', [
            'doctor_id' => $doctor->id,
            'service_id' => $service->id,
            'appointment_date' => now()->addDays(2)->toDateString(),
            'appointment_time' => '11:00',
            'patient_complaint' => 'Keluhan konsultasi.',
            'phone' => '081234567891',
        ])->assertCreated();

        Sanctum::actingAs($admin);
        $notifRes = $this->getJson('/api/notifications');
        $notifId = $notifRes->json('data.0.id');
        $this->assertNotNull($notifId);

        // Delete single notification
        $deleteRes = $this->deleteJson("/api/notifications/{$notifId}");
        $deleteRes->assertOk()
            ->assertJson(['success' => true]);

        // Verify it is gone
        $afterDelete = $this->getJson('/api/notifications');
        $this->assertCount(0, $afterDelete->json('data'));
        $this->assertEquals(0, $afterDelete->json('unread_count'));
    }

    public function test_user_can_delete_all_notifications(): void
    {
        $admin = $this->createAdmin();
        $patient = $this->createPatient();
        $doctor = $this->createDoctor();
        $service = $this->createService($doctor->specialization_id);

        Sanctum::actingAs($patient);
        $this->postJson('/api/bookings', [
            'doctor_id' => $doctor->id,
            'service_id' => $service->id,
            'appointment_date' => now()->addDays(2)->toDateString(),
            'appointment_time' => '11:00',
            'patient_complaint' => 'Keluhan konsultasi 1.',
            'phone' => '081234567891',
        ])->assertCreated();

        $this->postJson('/api/bookings', [
            'doctor_id' => $doctor->id,
            'service_id' => $service->id,
            'appointment_date' => now()->addDays(3)->toDateString(),
            'appointment_time' => '14:00',
            'patient_complaint' => 'Keluhan konsultasi 2.',
            'phone' => '081234567891',
        ])->assertCreated();

        Sanctum::actingAs($admin);
        $notifRes = $this->getJson('/api/notifications');
        $this->assertGreaterThanOrEqual(2, count($notifRes->json('data')));

        // Delete all
        $delAll = $this->deleteJson('/api/notifications');
        $delAll->assertOk()->assertJson(['success' => true]);

        $afterAll = $this->getJson('/api/notifications');
        $this->assertCount(0, $afterAll->json('data'));
        $this->assertEquals(0, $afterAll->json('unread_count'));
    }

    public function test_user_cannot_delete_other_user_notification(): void
    {
        $admin = $this->createAdmin();
        $patient = $this->createPatient();
        $doctor = $this->createDoctor();
        $service = $this->createService($doctor->specialization_id);

        Sanctum::actingAs($patient);
        $this->postJson('/api/bookings', [
            'doctor_id' => $doctor->id,
            'service_id' => $service->id,
            'appointment_date' => now()->addDays(2)->toDateString(),
            'appointment_time' => '11:00',
            'patient_complaint' => 'Keluhan konsultasi.',
            'phone' => '081234567891',
        ])->assertCreated();

        Sanctum::actingAs($admin);
        $notifRes = $this->getJson('/api/notifications');
        $adminNotifId = $notifRes->json('data.0.id');

        // Patient tries to delete admin's notification
        Sanctum::actingAs($patient);
        $this->deleteJson("/api/notifications/{$adminNotifId}")->assertNotFound();
    }
}
