<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_rejects_a_password_that_does_not_meet_the_policy(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Budi Santoso',
            'email' => 'budi@example.test',
            'phone' => '081234567890',
            'password' => 'lowercase123!',
            'password_confirmation' => 'lowercase123!',
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('password');
        $this->assertDatabaseMissing('users', ['email' => 'budi@example.test']);
    }

    public function test_registration_accepts_a_password_that_meets_the_policy(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Budi Santoso',
            'email' => 'budi@example.test',
            'phone' => '081234567890',
            'password' => 'KataSandiAman!123',
            'password_confirmation' => 'KataSandiAman!123',
        ]);

        $response->assertCreated()->assertJsonPath('success', true);
        $this->assertDatabaseHas('users', ['email' => 'budi@example.test']);
    }

    public function test_registration_accepts_a_six_character_password_when_it_meets_the_complexity_policy(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Budi Enam',
            'email' => 'six-char@example.test',
            'phone' => '081234567890',
            'password' => 'Aa1!bc',
            'password_confirmation' => 'Aa1!bc',
        ])->assertCreated();
    }

    public function test_registration_rejects_passwords_shorter_than_six_characters(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Budi Lima',
            'email' => 'five-char@example.test',
            'password' => 'Aa1!b',
            'password_confirmation' => 'Aa1!b',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('password');
    }

    public function test_patient_registration_creates_a_parent_account_and_guardian_profile(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Budi Pasien',
            'email' => 'patient-role@example.test',
            'phone' => '081234567890',
            'role' => 'patient',
            'password' => 'KataSandiAman!123',
            'password_confirmation' => 'KataSandiAman!123',
        ])->assertCreated()
            ->assertJsonPath('data.user.role', 'parent');

        $user = User::where('email', 'patient-role@example.test')->firstOrFail();
        $this->assertDatabaseHas('guardians', ['user_id' => $user->id]);
    }

    public function test_doctor_registration_creates_a_therapist_account(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Dokter Baru',
            'email' => 'doctor-role@example.test',
            'role' => 'doctor',
            'password' => 'KataSandiAman!123',
            'password_confirmation' => 'KataSandiAman!123',
        ])->assertCreated()
            ->assertJsonPath('data.user.role', 'therapist');
    }

    public function test_public_registration_cannot_create_an_admin_account(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Admin Publik',
            'email' => 'public-admin@example.test',
            'role' => 'admin',
            'password' => 'KataSandiAman!123',
            'password_confirmation' => 'KataSandiAman!123',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('role');

        $this->assertDatabaseMissing('users', ['email' => 'public-admin@example.test']);
    }

    public function test_login_is_throttled_after_five_attempts_for_the_same_credential_and_ip(): void
    {
        User::create([
            'name' => 'Budi Santoso',
            'email' => 'budi@example.test',
            'password' => Hash::make('KataSandiAman!123'),
            'role' => 'patient',
        ]);

        $credentials = [
            'email' => 'budi@example.test',
            'password' => 'kata-sandi-salah',
        ];

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.10'])
                ->postJson('/api/auth/login', $credentials)
                ->assertUnprocessable();
        }

        $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.10'])
            ->postJson('/api/auth/login', $credentials)
            ->assertStatus(429)
            ->assertHeader('Retry-After')
            ->assertJsonPath('success', false);
    }
}
