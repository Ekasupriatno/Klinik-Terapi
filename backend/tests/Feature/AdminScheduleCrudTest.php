<?php

namespace Tests\Feature;

use App\Models\Doctor;
use App\Models\Schedule;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminScheduleCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_read_update_and_delete_a_schedule(): void
    {
        Sanctum::actingAs($this->admin());
        
        $specialization = Specialization::create([
            'name' => 'Fisioterapi',
            'slug' => 'fisioterapi',
        ]);

        $doctor = Doctor::create([
            'specialization_id' => $specialization->id,
            'name' => 'dr. Test Doctor',
            'sip_number' => 'SIP/446/2026/001',
            'experience_years' => 5,
            'consultation_fee' => 200000,
            'is_active' => true,
        ]);

        $payload = [
            'doctor_id' => $doctor->id,
            'day_of_week' => 'monday',
            'start_time' => '09:00',
            'end_time' => '15:00',
            'slot_duration_minutes' => 30,
            'max_quota_per_slot' => 3,
            'is_active' => true,
        ];

        $create = $this->postJson('/api/admin/schedules', $payload);
        $create->assertCreated()
            ->assertJsonPath('data.day_of_week', 'monday')
            ->assertJsonPath('data.start_time', '09:00')
            ->assertJsonPath('data.end_time', '15:00');

        $scheduleId = $create->json('data.id');

        $this->getJson("/api/schedules/doctor/{$doctor->id}")
            ->assertOk()
            ->assertJsonFragment(['id' => $scheduleId, 'day_of_week' => 'monday']);

        $this->putJson("/api/admin/schedules/{$scheduleId}", [
            'day_of_week' => 'tuesday',
            'start_time' => '10:00',
            'end_time' => '16:00',
            'slot_duration_minutes' => 45,
        ])->assertOk()
            ->assertJsonPath('data.day_of_week', 'tuesday')
            ->assertJsonPath('data.start_time', '10:00')
            ->assertJsonPath('data.slot_duration_minutes', 45);

        $this->deleteJson("/api/admin/schedules/{$scheduleId}")->assertOk();
        $this->assertDatabaseMissing('schedules', ['id' => $scheduleId]);
    }

    public function test_non_admin_cannot_manage_schedules(): void
    {
        Sanctum::actingAs(User::create([
            'name' => 'Pasien',
            'email' => 'pasien@example.test',
            'password' => Hash::make('KataSandiAman!123'),
            'role' => 'patient',
        ]));

        $this->postJson('/api/admin/schedules', [])->assertForbidden();
    }

    public function test_schedule_end_time_must_be_after_start_time(): void
    {
        Sanctum::actingAs($this->admin());
        
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
            'day_of_week' => 'monday',
            'start_time' => '15:00',
            'end_time' => '09:00',
            'slot_duration_minutes' => 30,
        ];

        $this->postJson('/api/admin/schedules', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['end_time']);
    }

    private function admin(): User
    {
        return User::create([
            'name' => 'Admin Klinik',
            'email' => 'admin@example.test',
            'password' => Hash::make('KataSandiAman!123'),
            'role' => 'admin',
        ]);
    }
}
