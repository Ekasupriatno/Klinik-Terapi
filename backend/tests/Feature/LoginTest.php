<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_login_with_correct_credentials(): void
    {
        $admin = User::create([
            'name' => 'Administrator Klinik',
            'email' => 'admin@klinikterapi.com',
            'phone' => '081234567890',
            'password' => Hash::make('AdminKlinik!2026'),
            'role' => 'admin',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'admin@klinikterapi.com',
            'password' => 'AdminKlinik!2026',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.email', 'admin@klinikterapi.com')
            ->assertJsonPath('data.user.role', 'admin')
            ->assertJsonStructure([
                'data' => [
                    'user',
                    'token',
                    'token_type',
                ],
            ]);
    }

    public function test_patient_can_login_with_correct_credentials(): void
    {
        $patient = User::create([
            'name' => 'Budi Santoso',
            'email' => 'pasien@gmail.com',
            'phone' => '089876543210',
            'password' => Hash::make('PasienDemo!2026'),
            'role' => 'patient',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'pasien@gmail.com',
            'password' => 'PasienDemo!2026',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.email', 'pasien@gmail.com')
            ->assertJsonPath('data.user.role', 'patient')
            ->assertJsonStructure([
                'data' => [
                    'user',
                    'token',
                    'token_type',
                ],
            ]);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('CorrectPassword123'),
            'role' => 'patient',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'WrongPassword123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_login_fails_with_nonexistent_user(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'SomePassword123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }
}
