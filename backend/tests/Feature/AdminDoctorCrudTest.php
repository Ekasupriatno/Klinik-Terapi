<?php

namespace Tests\Feature;

use App\Models\Doctor;
use App\Models\Specialization;
use App\Models\User;
use App\Jobs\ProcessDoctorImageJob;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminDoctorCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_read_update_and_delete_a_doctor(): void
    {
        Sanctum::actingAs($this->admin());
        $specialization = Specialization::create([
            'name' => 'Fisioterapi',
            'slug' => 'fisioterapi',
        ]);

        $payload = [
            'specialization_id' => $specialization->id,
            'name' => 'dr. Sari Utami',
            'sip_number' => 'SIP/446/2026/001',
            'title' => 'Sp.KFR',
            'experience_years' => 8,
            'consultation_fee' => 250000,
            'bio' => 'Fokus rehabilitasi fisik.',
            'image_url' => 'https://example.test/dokter-sari.jpg',
            'is_active' => true,
        ];

        $create = $this->postJson('/api/admin/doctors', $payload);
        $create->assertCreated()
            ->assertJsonPath('data.name', 'dr. Sari Utami')
            ->assertJsonPath('data.specialization.id', $specialization->id);

        $doctorId = $create->json('data.id');

        $this->getJson('/api/admin/doctors')
            ->assertOk()
            ->assertJsonFragment(['id' => $doctorId, 'sip_number' => 'SIP/446/2026/001']);

        $this->putJson("/api/admin/doctors/{$doctorId}", [
            ...$payload,
            'name' => 'dr. Sari Utami, Sp.KFR',
            'is_active' => false,
        ])->assertOk()
            ->assertJsonPath('data.name', 'dr. Sari Utami, Sp.KFR')
            ->assertJsonPath('data.is_active', false);

        $this->deleteJson("/api/admin/doctors/{$doctorId}")->assertOk();
        $this->assertSoftDeleted('doctors', ['id' => $doctorId]);
    }

    public function test_admin_can_assign_a_therapist_account_to_a_doctor(): void
    {
        Sanctum::actingAs($this->admin());
        $therapist = User::create([
            'name' => 'dr. Akun Tes',
            'email' => 'doctor-account@example.test',
            'password' => Hash::make('KataSandiAman!123'),
            'role' => 'therapist',
        ]);
        $specialization = Specialization::create([
            'name' => 'Fisioterapi',
            'slug' => 'fisioterapi',
        ]);

        $this->postJson('/api/admin/doctors', [
            'user_id' => $therapist->id,
            'specialization_id' => $specialization->id,
            'name' => 'dr. Akun Tes',
            'sip_number' => 'SIP/446/2026/ACC',
            'experience_years' => 5,
            'consultation_fee' => 200000,
            'is_active' => true,
        ])
            ->assertCreated()
            ->assertJsonPath('data.therapist_account.id', $therapist->id);

        $this->getJson('/api/admin/therapist-accounts')
            ->assertOk()
            ->assertJsonFragment(['id' => $therapist->id, 'email' => 'doctor-account@example.test']);
    }

    public function test_admin_can_create_doctor_with_image_upload(): void
    {
        Sanctum::actingAs($this->admin());
        Storage::fake('public');
        $specialization = Specialization::create([
            'name' => 'Fisioterapi',
            'slug' => 'fisioterapi',
        ]);

        $payload = [
            'specialization_id' => $specialization->id,
            'name' => 'dr. Budi Santoso',
            'sip_number' => 'SIP/446/2026/002',
            'title' => 'Sp.KFR',
            'experience_years' => 5,
            'consultation_fee' => 200000,
            'bio' => 'Spesialis rehabilitasi ortopedi.',
            'image' => \Illuminate\Http\UploadedFile::fake()->image('doctor.jpg', 400, 400),
            'is_active' => true,
        ];

        $create = $this->postJson('/api/admin/doctors', $payload);
        $create->assertCreated()
            ->assertJsonPath('data.name', 'dr. Budi Santoso')
            ->assertJsonPath('data.image_url', fn($url) => str_contains($url, 'storage/doctors/optimized/'))
            ->assertJsonPath('data.image_thumbnail_url', fn($url) => str_contains($url, 'storage/doctors/thumbnails/'));

        $doctorId = $create->json('data.id');
        $doctor = Doctor::findOrFail($doctorId);

        $this->assertDatabaseHas('doctors', [
            'id' => $doctorId,
            'name' => 'dr. Budi Santoso',
            'sip_number' => 'SIP/446/2026/002',
        ]);
        Storage::disk('public')->assertMissing('doctors/temp/' . basename($doctor->image_url));
    }

    public function test_admin_can_update_doctor_with_new_image(): void
    {
        Sanctum::actingAs($this->admin());
        Storage::fake('public');
        $specialization = Specialization::create([
            'name' => 'Fisioterapi',
            'slug' => 'fisioterapi',
        ]);

        $doctor = Doctor::create([
            'specialization_id' => $specialization->id,
            'name' => 'dr. Test',
            'sip_number' => 'SIP/446/2026/003',
            'experience_years' => 3,
            'consultation_fee' => 150000,
            'image_url' => 'https://example.test/old-image.jpg',
            'is_active' => true,
        ]);

        $updatePayload = [
            'specialization_id' => $specialization->id,
            'name' => 'dr. Test Updated',
            'sip_number' => 'SIP/446/2026/003',
            'experience_years' => 4,
            'consultation_fee' => 180000,
            'image' => \Illuminate\Http\UploadedFile::fake()->image('new-doctor.jpg', 400, 400),
            'is_active' => true,
        ];

        $update = $this->putJson("/api/admin/doctors/{$doctor->id}", $updatePayload);
        $update->assertOk()
            ->assertJsonPath('data.name', 'dr. Test Updated')
            ->assertJsonPath('data.image_url', fn($url) => str_contains($url, 'storage/doctors/'));
    }

    public function test_admin_can_update_doctor_with_multipart_image_upload(): void
    {
        Sanctum::actingAs($this->admin());
        Storage::fake('public');
        Queue::fake();

        $specialization = Specialization::create([
            'name' => 'Fisioterapi',
            'slug' => 'fisioterapi',
        ]);
        $doctor = Doctor::create([
            'specialization_id' => $specialization->id,
            'name' => 'dr. Test',
            'sip_number' => 'SIP/446/2026/004',
            'experience_years' => 3,
            'consultation_fee' => 150000,
            'is_active' => true,
        ]);

        $update = $this->post("/api/admin/doctors/{$doctor->id}", [
            '_method' => 'PUT',
            'specialization_id' => $specialization->id,
            'name' => 'dr. Test Updated',
            'sip_number' => $doctor->sip_number,
            'experience_years' => 4,
            'consultation_fee' => 180000,
            'image' => UploadedFile::fake()->image('updated-doctor.jpg', 400, 400),
            'is_active' => '1',
        ]);

        $update->assertOk()
            ->assertJsonPath('data.name', 'dr. Test Updated')
            ->assertJsonPath('data.is_active', true)
            ->assertJsonPath('data.image_url', fn($url) => str_contains($url, 'storage/doctors/temp/'));
        Queue::assertPushed(ProcessDoctorImageJob::class);
    }

    public function test_non_admin_cannot_manage_doctors(): void
    {
        Sanctum::actingAs(User::create([
            'name' => 'Pasien',
            'email' => 'pasien@example.test',
            'password' => Hash::make('KataSandiAman!123'),
            'role' => 'patient',
        ]));

        $this->postJson('/api/admin/doctors', [])->assertForbidden();
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
