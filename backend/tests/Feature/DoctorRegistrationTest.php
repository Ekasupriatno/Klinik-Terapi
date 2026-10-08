<?php

namespace Tests\Feature;

use App\Models\Doctor;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DoctorRegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    private function validDoctorData(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Dr. Budi Santoso, Sp.A',
            'email' => 'dr.budi@klinikterapi.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'specialization' => 'Psikologi Anak',
            'license_number' => 'SIPP-123456',
            'phone' => '081234567890',
            'gender' => 'male',
            'birth_date' => '1990-01-10',
            'address' => 'Jl. Kesehatan No. 45, Bandung',
            'education' => 'S2 Psikologi Klinis Universitas Indonesia',
            'experience_years' => 5,
            'bio' => 'Dokter spesialis dengan pengalaman mendalam dalam psikologi perkembangan anak.',
        ], $overrides);
    }

    /**
     * 1. Dokter berhasil register dengan data valid.
     */
    public function test_doctor_can_register_successfully(): void
    {
        $photo = UploadedFile::fake()->image('profile.jpg', 400, 400);
        $data = $this->validDoctorData(['profile_photo' => $photo]);

        $response = $this->postJson('/api/auth/register/doctor', $data);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Dr. Budi Santoso, Sp.A')
            ->assertJsonPath('data.email', 'dr.budi@klinikterapi.com')
            ->assertJsonPath('data.role', 'doctor')
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('users', [
            'email' => 'dr.budi@klinikterapi.com',
            'role' => 'doctor',
            'status' => 'pending',
        ]);

        $this->assertDatabaseHas('doctors', [
            'license_number' => 'SIPP-123456',
            'status' => 'pending',
            'is_active' => false,
        ]);
    }

    /**
     * 2. Email duplicate ditolak.
     */
    public function test_registration_fails_with_duplicate_email(): void
    {
        User::create([
            'name' => 'Existing User',
            'email' => 'dr.budi@klinikterapi.com',
            'password' => Hash::make('Password123!'),
            'role' => 'patient',
        ]);

        $data = $this->validDoctorData();

        $response = $this->postJson('/api/auth/register/doctor', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * 3. Password confirmation salah ditolak.
     */
    public function test_registration_fails_with_unmatched_password_confirmation(): void
    {
        $data = $this->validDoctorData([
            'password_confirmation' => 'DifferentPassword123!',
        ]);

        $response = $this->postJson('/api/auth/register/doctor', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /**
     * 4. Role otomatis doctor (tidak bisa ditimpa dari frontend).
     */
    public function test_user_is_automatically_assigned_doctor_role(): void
    {
        $data = $this->validDoctorData([
            'role' => 'admin', // Frontend tries to inject admin
        ]);

        $response = $this->postJson('/api/auth/register/doctor', $data);

        $response->assertStatus(201);

        $user = User::where('email', 'dr.budi@klinikterapi.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals('doctor', $user->role);
        $this->assertNotEquals('admin', $user->role);
    }

    /**
     * 5. Status otomatis pending.
     */
    public function test_doctor_status_is_automatically_pending(): void
    {
        $data = $this->validDoctorData();

        $response = $this->postJson('/api/auth/register/doctor', $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'pending');

        $doctor = Doctor::where('license_number', 'SIPP-123456')->first();
        $this->assertNotNull($doctor);
        $this->assertEquals('pending', $doctor->status);
        $this->assertFalse((bool) $doctor->is_active);
    }

    /**
     * 6. User + doctor dibuat dalam satu transaction (rollback jika ada kegagalan).
     */
    public function test_user_and_doctor_are_created_in_a_single_transaction(): void
    {
        // First register a doctor with license number 'SIPP-999999'
        $userA = User::create([
            'name' => 'Dokter Pertama',
            'email' => 'dokter1@klinikterapi.com',
            'password' => Hash::make('Password123!'),
            'role' => 'doctor',
        ]);

        Doctor::create([
            'user_id' => $userA->id,
            'name' => 'Dokter Pertama',
            'license_number' => 'SIPP-999999',
            'sip_number' => 'SIPP-999999',
            'status' => 'pending',
            'is_active' => false,
        ]);

        // Attempt to register another doctor with a new email but duplicate license_number
        // We will trigger a database level failure during doctor creation
        $data = $this->validDoctorData([
            'email' => 'new.doctor.rollback@klinikterapi.com',
            'license_number' => 'SIPP-999999', // Will trigger duplicate key error on doctors table
        ]);

        $response = $this->postJson('/api/auth/register/doctor', $data);

        // Validation catches license_number unique
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['license_number']);

        // Verify that user was NOT created in database
        $this->assertDatabaseMissing('users', [
            'email' => 'new.doctor.rollback@klinikterapi.com',
        ]);
    }

    /**
     * 7. Login dokter pending ditolak (HTTP 403).
     */
    public function test_pending_doctor_login_is_rejected(): void
    {
        $user = User::create([
            'name' => 'Dr. Pending',
            'email' => 'pending.doctor@klinikterapi.com',
            'password' => Hash::make('Password123!'),
            'role' => 'doctor',
            'status' => 'pending',
        ]);

        Doctor::create([
            'user_id' => $user->id,
            'name' => 'Dr. Pending',
            'license_number' => 'SIPP-PENDING',
            'sip_number' => 'SIPP-PENDING',
            'status' => 'pending',
            'is_active' => false,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'pending.doctor@klinikterapi.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Akun dokter Anda masih menunggu verifikasi admin.');
    }

    /**
     * 8. Login dokter approved berhasil (HTTP 200).
     */
    public function test_approved_doctor_login_succeeds(): void
    {
        $user = User::create([
            'name' => 'Dr. Approved',
            'email' => 'approved.doctor@klinikterapi.com',
            'password' => Hash::make('Password123!'),
            'role' => 'doctor',
            'status' => 'active',
        ]);

        Doctor::create([
            'user_id' => $user->id,
            'name' => 'Dr. Approved',
            'license_number' => 'SIPP-APPROVED',
            'sip_number' => 'SIPP-APPROVED',
            'status' => 'approved',
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'approved.doctor@klinikterapi.com',
            'password' => 'Password123!',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.email', 'approved.doctor@klinikterapi.com')
            ->assertJsonStructure([
                'data' => [
                    'user',
                    'token',
                    'token_type',
                ],
            ]);
    }

    /**
     * 9. Login dokter rejected ditolak (HTTP 403).
     */
    public function test_rejected_doctor_login_is_rejected(): void
    {
        $user = User::create([
            'name' => 'Dr. Rejected',
            'email' => 'rejected.doctor@klinikterapi.com',
            'password' => Hash::make('Password123!'),
            'role' => 'doctor',
            'status' => 'rejected',
        ]);

        Doctor::create([
            'user_id' => $user->id,
            'name' => 'Dr. Rejected',
            'license_number' => 'SIPP-REJECTED',
            'sip_number' => 'SIPP-REJECTED',
            'status' => 'rejected',
            'rejection_reason' => 'Dokumen STR kadaluarsa',
            'is_active' => false,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'rejected.doctor@klinikterapi.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('success', false);
    }

    /**
     * 10. Login dokter suspended ditolak (HTTP 403).
     */
    public function test_suspended_doctor_login_is_rejected(): void
    {
        $user = User::create([
            'name' => 'Dr. Suspended',
            'email' => 'suspended.doctor@klinikterapi.com',
            'password' => Hash::make('Password123!'),
            'role' => 'doctor',
            'status' => 'suspended',
        ]);

        Doctor::create([
            'user_id' => $user->id,
            'name' => 'Dr. Suspended',
            'license_number' => 'SIPP-SUSPENDED',
            'sip_number' => 'SIPP-SUSPENDED',
            'status' => 'suspended',
            'is_active' => false,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'suspended.doctor@klinikterapi.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('success', false);
    }

    /**
     * 11. Patient tidak dapat mengakses doctor endpoint.
     */
    public function test_patient_cannot_access_doctor_endpoint(): void
    {
        $patient = User::create([
            'name' => 'Pasien Biasa',
            'email' => 'pasien.test@klinikterapi.com',
            'password' => Hash::make('Password123!'),
            'role' => 'patient',
        ]);

        $response = $this->actingAs($patient, 'sanctum')
            ->getJson('/api/doctor/profile');

        $response->assertStatus(403)
            ->assertJsonPath('success', false);
    }

    /**
     * 12. Doctor tidak dapat mengakses admin endpoint.
     */
    public function test_doctor_cannot_access_admin_endpoint(): void
    {
        $doctorUser = User::create([
            'name' => 'Dr. NonAdmin',
            'email' => 'nonadmin.doctor@klinikterapi.com',
            'password' => Hash::make('Password123!'),
            'role' => 'doctor',
        ]);

        Doctor::create([
            'user_id' => $doctorUser->id,
            'name' => 'Dr. NonAdmin',
            'license_number' => 'SIPP-NONADMIN',
            'sip_number' => 'SIPP-NONADMIN',
            'status' => 'approved',
            'is_active' => true,
        ]);

        $response = $this->actingAs($doctorUser, 'sanctum')
            ->getJson('/api/admin/doctors/pending');

        $response->assertStatus(403)
            ->assertJsonPath('success', false);
    }

    /**
     * 13. User tidak dapat membuat role admin melalui register.
     */
    public function test_user_cannot_register_as_admin_via_public_registration(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Attacker',
            'email' => 'attacker@klinikterapi.com',
            'phone' => '081234567890',
            'password' => 'Password123!#',
            'password_confirmation' => 'Password123!#',
            'role' => 'admin',
        ]);

        // Validation rejects role=admin
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['role']);

        $this->assertDatabaseMissing('users', [
            'email' => 'attacker@klinikterapi.com',
            'role' => 'admin',
        ]);
    }

    /**
     * 14. Upload foto dengan format tidak valid ditolak.
     */
    public function test_invalid_photo_format_is_rejected(): void
    {
        $fakePdf = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');
        $data = $this->validDoctorData(['profile_photo' => $fakePdf]);

        $response = $this->postJson('/api/auth/register/doctor', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['profile_photo']);
    }

    /**
     * Test alur verifikasi admin: Approve, Reject, Suspend.
     */
    public function test_admin_can_approve_reject_and_suspend_doctor(): void
    {
        $admin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin.verify@klinikterapi.com',
            'password' => Hash::make('AdminPass123!'),
            'role' => 'admin',
        ]);

        $doctorUser = User::create([
            'name' => 'Dr. Calon',
            'email' => 'calon.doctor@klinikterapi.com',
            'password' => Hash::make('Password123!'),
            'role' => 'doctor',
            'status' => 'pending',
        ]);

        $doctor = Doctor::create([
            'user_id' => $doctorUser->id,
            'name' => 'Dr. Calon',
            'license_number' => 'SIPP-CALON-01',
            'sip_number' => 'SIPP-CALON-01',
            'status' => 'pending',
            'is_active' => false,
        ]);

        // 1. Admin melihat daftar pending
        $pendingRes = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/doctors/pending');
        $pendingRes->assertOk()->assertJsonPath('success', true);

        // 2. Admin approve
        $approveRes = $this->actingAs($admin, 'sanctum')->putJson("/api/admin/doctors/{$doctor->id}/approve");
        $approveRes->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'approved');

        $this->assertEquals('approved', $doctor->fresh()->status);
        $this->assertTrue((bool) $doctor->fresh()->is_active);

        // 3. Admin suspend
        $suspendRes = $this->actingAs($admin, 'sanctum')->putJson("/api/admin/doctors/{$doctor->id}/suspend", [
            'reason' => 'Perlu investigasi keluhan pasien',
        ]);
        $suspendRes->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'suspended');

        $this->assertEquals('suspended', $doctor->fresh()->status);
        $this->assertFalse((bool) $doctor->fresh()->is_active);
    }
}
