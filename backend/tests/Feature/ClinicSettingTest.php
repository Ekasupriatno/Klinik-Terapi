<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\ClinicSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ClinicSettingTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin(): User
    {
        return User::create([
            'name' => 'Admin Klinik',
            'email' => 'admin.test@example.com',
            'password' => Hash::make('Password123!'),
            'role' => 'admin',
        ]);
    }

    private function createPatient(): User
    {
        return User::create([
            'name' => 'Pasien Tes',
            'email' => 'patient.test@example.com',
            'password' => Hash::make('Password123!'),
            'role' => 'patient',
        ]);
    }

    public function test_public_user_can_retrieve_clinic_settings(): void
    {
        $response = $this->getJson('/api/settings');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'name',
                    'phone',
                    'whatsapp',
                    'email',
                    'address',
                    'operational_hours',
                ],
            ]);
    }

    public function test_admin_can_retrieve_clinic_settings(): void
    {
        Sanctum::actingAs($this->createAdmin());

        $response = $this->getJson('/api/admin/settings');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'name',
                    'phone',
                    'whatsapp',
                    'email',
                    'address',
                    'operational_hours',
                ],
            ]);
    }

    public function test_guest_cannot_update_clinic_settings(): void
    {
        $response = $this->putJson('/api/admin/settings', [
            'phone' => '+62 8111222333',
            'whatsapp' => '628111222333',
            'email' => 'new@klinik.com',
            'address' => 'Jl. Baru No. 123',
        ]);

        $response->assertUnauthorized();
    }

    public function test_patient_cannot_update_clinic_settings(): void
    {
        Sanctum::actingAs($this->createPatient());

        $response = $this->putJson('/api/admin/settings', [
            'phone' => '+62 8111222333',
            'whatsapp' => '628111222333',
            'email' => 'new@klinik.com',
            'address' => 'Jl. Baru No. 123',
        ]);

        $response->assertForbidden();
    }

    public function test_admin_can_update_clinic_settings_and_audit_log_is_recorded(): void
    {
        $admin = $this->createAdmin();
        Sanctum::actingAs($admin);

        $payload = [
            'name' => 'Klinik Terapi Terpadu Sejahtera',
            'phone' => '+62 812-9988-7766',
            'whatsapp' => '6281299887766',
            'email' => 'kontak@kliniksejahtera.com',
            'address' => 'Gedung Medika Lt. 2, Jl. Sudirman No. 45, Bandung',
            'operational_hours' => 'Senin - Sabtu: 08.00 - 20.00 WIB',
        ];

        $response = $this->putJson('/api/admin/settings', $payload);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Klinik Terapi Terpadu Sejahtera')
            ->assertJsonPath('data.phone', '+62 812-9988-7766')
            ->assertJsonPath('data.whatsapp', '6281299887766')
            ->assertJsonPath('data.email', 'kontak@kliniksejahtera.com')
            ->assertJsonPath('data.address', 'Gedung Medika Lt. 2, Jl. Sudirman No. 45, Bandung')
            ->assertJsonPath('data.operational_hours', 'Senin - Sabtu: 08.00 - 20.00 WIB');

        $this->assertDatabaseHas('clinic_settings', [
            'phone' => '+62 812-9988-7766',
            'whatsapp' => '6281299887766',
            'email' => 'kontak@kliniksejahtera.com',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'update',
            'entity' => 'clinic_settings',
            'user_id' => $admin->id,
        ]);
    }

    public function test_update_fails_with_invalid_email_and_missing_required_fields(): void
    {
        Sanctum::actingAs($this->createAdmin());

        $response = $this->putJson('/api/admin/settings', [
            'phone' => '',
            'whatsapp' => '',
            'email' => 'not-an-email',
            'address' => '',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['phone', 'whatsapp', 'email', 'address']);
    }
}
