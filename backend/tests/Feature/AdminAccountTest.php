<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminAccountTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_another_admin_account(): void
    {
        Sanctum::actingAs($this->user('admin', 'admin@example.test'));

        $this->postJson('/api/admin/accounts/admin', [
            'name' => 'Admin Baru',
            'email' => 'new-admin@example.test',
            'phone' => '081234567890',
            'password' => 'PasswordBaru!123',
            'password_confirmation' => 'PasswordBaru!123',
        ])->assertCreated()
            ->assertJsonPath('data.role', 'admin');

        $this->assertDatabaseHas('users', [
            'email' => 'new-admin@example.test',
            'role' => 'admin',
        ]);
    }

    public function test_non_admin_cannot_create_an_admin_account_or_change_admin_password(): void
    {
        Sanctum::actingAs($this->user('parent', 'parent@example.test'));

        $this->postJson('/api/admin/accounts/admin', [])->assertForbidden();
        $this->putJson('/api/admin/account/password', [])->assertForbidden();
    }

    public function test_receptionist_cannot_create_admin_accounts_or_change_an_admin_password(): void
    {
        Sanctum::actingAs($this->user('receptionist', 'receptionist@example.test'));

        $this->postJson('/api/admin/accounts/admin', [])->assertForbidden();
        $this->putJson('/api/admin/account/password', [])->assertForbidden();
    }

    public function test_admin_can_change_password_only_after_confirming_current_password(): void
    {
        $admin = $this->user('admin', 'change-password@example.test');
        Sanctum::actingAs($admin);

        $this->putJson('/api/admin/account/password', [
            'current_password' => 'WrongCurrent!123',
            'password' => 'PasswordBaru!123',
            'password_confirmation' => 'PasswordBaru!123',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('current_password');

        $this->assertTrue(Hash::check('KataSandiAman!123', $admin->fresh()->password));

        $this->putJson('/api/admin/account/password', [
            'current_password' => 'KataSandiAman!123',
            'password' => 'PasswordBaru!123',
            'password_confirmation' => 'PasswordBaru!123',
        ])->assertOk()
            ->assertJsonPath('success', true);

        $this->assertTrue(Hash::check('PasswordBaru!123', $admin->fresh()->password));
    }

    private function user(string $role, string $email): User
    {
        return User::create([
            'name' => ucfirst($role),
            'email' => $email,
            'password' => Hash::make('KataSandiAman!123'),
            'role' => $role,
        ]);
    }
}
