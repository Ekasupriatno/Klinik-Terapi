1. perbaiki CRUD di frontend agar bisa edit dan hapus ketika sudah memilih jadwal
2. pada bagian dashboard di kelola reservasi pasien berikan option delete

frontend(
- warna apa saja yang di perlukan
- format gambar lebih baik{
    logo.svg
    hero.avif/hero.webp
    testimoni project.avif
}
)

login mau seperti sekarang atau cuman input nama dan nomor telepone
perbaiki daftar dokter di landing page yang sedang berjaga hari ini
perbaiki data dashboard admin karena data tidak berubah ketika pasien booking
tambahkan CRUD pada kelola reservasi pasien


font alteHaasGroteskBold.ttf


Saya sedang mengembangkan aplikasi **Klinik-Terapi** menggunakan:

- Frontend: React + Vite
- Backend: Laravel API
- Authentication: Laravel Sanctum
- Database: MySQL
- HTTP client frontend: Axios

Buatkan fitur **Registrasi Dokter** yang production-ready, aman, rapi, scalable, dan mengikuti clean architecture.

## TUJUAN

Buat halaman khusus:

`/register/doctor`

Dokter dapat membuat akun, tetapi **tidak boleh langsung aktif**. Setelah registrasi, status dokter harus `pending` dan akun harus menunggu verifikasi Admin Klinik.

Alur:

Dokter Register
→ Validasi data
→ User dibuat dengan role `doctor`
→ Profil dokter dibuat
→ status = `pending`
→ Admin melakukan verifikasi
→ jika approved, dokter dapat login
→ jika rejected, dokter tidak dapat login

Admin **tidak boleh didaftarkan melalui register publik**.

---

# 1. DATABASE

Gunakan tabel `users` sebagai tabel autentikasi utama.

Struktur `users`:

- id
- name
- email
- password
- role
- email_verified_at
- created_at
- updated_at

Role:

- patient
- doctor
- admin

Buat tabel `doctors` dengan relasi:

`doctors.user_id -> users.id`

Field:

- id
- user_id
- specialization
- license_number
- phone
- gender
- birth_date
- address
- education
- experience_years
- bio
- profile_photo
- status
- created_at
- updated_at
- deleted_at

Status dokter:

- pending
- approved
- rejected
- suspended

Default:

`pending`

Gunakan:

- foreign key
- unique constraint pada `user_id`
- SoftDeletes pada doctors

Pastikan migration aman dan konsisten dengan database Laravel.

---

# 2. MODEL RELATION

Buat relasi:

User:

`hasOne(Doctor::class)`

Doctor:

`belongsTo(User::class)`

Gunakan `$fillable` dengan benar.

Jangan gunakan `$request->all()` secara langsung untuk membuat data.

---

# 3. API REGISTER DOKTER

Buat endpoint:

`POST /api/auth/register/doctor`

Request:

```json
{
    "name": "Dr. Budi Santoso",
    "email": "dokter@gmail.com",
    "password": "Password123!",
    "password_confirmation": "Password123!",
    "specialization": "Psikologi Anak",
    "license_number": "SIPP-123456",
    "phone": "08123456789",
    "gender": "male",
    "birth_date": "1990-01-10",
    "address": "Bandung",
    "education": "S2 Psikologi",
    "experience_years": 5,
    "bio": "Dokter dengan pengalaman dalam bidang psikologi anak."
}
```

Gunakan Laravel Form Request untuk validasi.

Validasi minimal:

- name required
- email required + valid email + unique
- password required + confirmed + minimal 8 karakter
- specialization required
- license_number required
- phone required
- gender required
- birth_date valid date
- education required
- experience_years integer >= 0
- bio nullable

Tambahkan validasi yang relevan agar data dokter tidak mudah disalahgunakan.

---

# 4. TRANSACTION

Gunakan:

`DB::transaction()`

Karena proses registrasi harus membuat:

1. User
2. Doctor

Jika salah satu gagal, seluruh proses harus rollback.

Contoh alur:

```text
BEGIN TRANSACTION
    create user
    create doctor
COMMIT
```

Jika error:

```text
ROLLBACK
```

---

# 5. ROLE SECURITY

Role `doctor` harus ditentukan oleh backend.

Jangan pernah mengambil role dari frontend seperti:

```json
{
    "role": "doctor"
}
```

Backend harus selalu menetapkan:

```php
'role' => 'doctor'
```

Jangan izinkan user mengirim:

```json
{
    "role": "admin"
}
```

untuk mendapatkan hak admin.

---

# 6. PASSWORD

Gunakan:

```php
Hash::make()
```

Jangan simpan password plaintext.

Jangan pernah mengembalikan password di response API.

Pastikan field password masuk `$hidden` pada model User.

---

# 7. EMAIL VERIFICATION

Setelah registrasi dokter berhasil:

- akun dibuat
- status dokter = pending
- kirim email verification
- dokter belum boleh masuk dashboard sebelum proses verifikasi selesai

Gunakan fitur email verification Laravel jika konfigurasi project sudah tersedia.

---

# 8. LOGIN DOKTER

Tetap gunakan endpoint login umum:

`POST /api/auth/login`

Jangan membuat sistem autentikasi terpisah seperti:

`/api/doctor/login`

Backend harus mendeteksi:

```text
role = doctor
```

kemudian mengecek:

```text
doctor.status
```

Login harus ditolak jika:

- status = pending
- status = rejected
- status = suspended

Hanya:

`status = approved`

yang boleh masuk dashboard dokter.

Berikan response JSON yang jelas untuk masing-masing kondisi.

Contoh:

```json
{
    "message": "Akun dokter Anda masih menunggu verifikasi admin."
}
```

---

# 9. ADMIN APPROVAL

Buat API Admin untuk memverifikasi dokter.

Endpoint contoh:

```text
GET    /api/admin/doctors/pending
GET    /api/admin/doctors/{id}
PUT    /api/admin/doctors/{id}/approve
PUT    /api/admin/doctors/{id}/reject
PUT    /api/admin/doctors/{id}/suspend
```

Hanya user dengan role `admin` yang dapat mengakses endpoint tersebut.

Ketika approve:

```text
pending → approved
```

Ketika reject:

```text
pending → rejected
```

Ketika suspend:

```text
approved → suspended
```

Tambahkan alasan rejection/suspension bila diperlukan.

---

# 10. FRONTEND REACT

Buat:

`src/pages/auth/RegisterDoctor.jsx`

Desain harus terlihat profesional seperti aplikasi klinik modern.

Form dibagi menjadi beberapa section:

### Informasi Akun

- Nama lengkap
- Email
- Password
- Konfirmasi password

### Informasi Profesional

- Spesialisasi
- Nomor lisensi
- Pendidikan
- Pengalaman kerja

### Informasi Pribadi

- Nomor telepon
- Jenis kelamin
- Tanggal lahir
- Alamat

### Profil

- Bio
- Foto profil

Gunakan UX yang baik:

- password visibility toggle
- loading state
- disabled submit saat proses
- validasi field
- pesan error per field
- success notification
- responsive
- aksesibilitas dasar
- label form yang jelas

---

# 11. FOTO PROFIL

Untuk profile photo:

- gunakan multipart/form-data
- batasi ukuran file
- validasi MIME type
- hanya izinkan format seperti JPG, JPEG, PNG, WebP
- jangan mempercayai extension file saja
- simpan file menggunakan Laravel Storage
- jangan menyimpan file besar tanpa validasi

Bila memungkinkan, buat struktur:

```text
storage/app/public/doctors/
```

dan gunakan Laravel Storage untuk mengelola file.

---

# 12. AXIOS SERVICE

Buat service:

`src/services/authService.js`

Tambahkan function:

```js
registerDoctor(data)
```

yang melakukan:

```text
POST /api/auth/register/doctor
```

Gunakan `FormData` jika terdapat foto profil.

Jangan memasukkan password atau data sensitif ke console log.

---

# 13. RESPONSE API

Gunakan response yang konsisten.

Success:

```json
{
    "success": true,
    "message": "Registrasi dokter berhasil. Akun Anda sedang menunggu verifikasi admin.",
    "data": {
        "id": 1,
        "name": "Dr. Budi Santoso",
        "email": "dokter@gmail.com",
        "role": "doctor",
        "status": "pending"
    }
}
```

Validation error:

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "email": [
            "Email sudah digunakan."
        ]
    }
}
```

Jangan return data sensitif seperti:

- password
- password_confirmation
- token yang tidak diperlukan

---

# 14. BACKEND STRUCTURE

Gunakan struktur Laravel yang rapi:

```text
app/
├── Http/
│   ├── Controllers/
│   │   ├── AuthController.php
│   │   └── Admin/
│   │       └── DoctorController.php
│   │
│   └── Requests/
│       └── Auth/
│           └── RegisterDoctorRequest.php
│
├── Models/
│   ├── User.php
│   └── Doctor.php
```

Gunakan service layer bila diperlukan agar controller tidak terlalu gemuk.

---

# 15. SECURITY

Pastikan:

- password di-hash
- mass assignment aman
- role tidak berasal dari user input
- validasi backend tetap wajib walaupun frontend sudah validasi
- rate limiting pada authentication endpoint
- Sanctum digunakan untuk authentication
- endpoint admin menggunakan authorization
- dokter tidak dapat mengakses endpoint pasien/admin
- pasien tidak dapat mengakses endpoint dokter
- admin tidak mendapatkan akses data yang tidak diperlukan
- jangan expose stack trace pada production
- jangan expose password atau token di log

---

# 16. AUTHORIZATION

Buat middleware/authorization yang memungkinkan:

```text
admin → admin routes
doctor → doctor routes
patient → patient routes
```

Contoh:

```text
/api/admin/*
/api/doctor/*
/api/patient/*
```

User tidak boleh hanya mengandalkan proteksi React.

Semua authorization harus tetap dilakukan di backend.

---

# 17. AFTER REGISTER

Setelah dokter berhasil mendaftar, React jangan langsung redirect ke dashboard dokter.

Redirect ke:

`/register/doctor/success`

Tampilkan:

```text
Registrasi Berhasil

Akun dokter Anda telah berhasil dibuat.

Status:
Menunggu Verifikasi Admin

Anda akan dapat login setelah akun diverifikasi oleh Admin Klinik.

Silakan cek email Anda untuk melakukan verifikasi email.
```

Berikan tombol:

`Kembali ke Login`

---

# 18. ERROR HANDLING

Tangani dengan baik:

- email sudah digunakan
- validation error
- database error
- upload error
- network error
- server error
- email verification failure

Jangan tampilkan error database mentah kepada user.

---

# 19. TESTING

Buat Feature Test Laravel untuk:

1. dokter berhasil register
2. email duplicate ditolak
3. password confirmation salah ditolak
4. role otomatis doctor
5. status otomatis pending
6. user + doctor dibuat dalam satu transaction
7. login dokter pending ditolak
8. login dokter approved berhasil
9. login dokter rejected ditolak
10. login dokter suspended ditolak
11. patient tidak dapat mengakses doctor endpoint
12. doctor tidak dapat mengakses admin endpoint
13. user tidak dapat membuat role admin melalui register
14. upload foto dengan format tidak valid ditolak

---

# 20. OUTPUT YANG SAYA INGINKAN

Jangan hanya memberikan contoh kode.

Implementasikan fitur secara lengkap dan jelaskan file mana saja yang harus dibuat atau diubah.

Tampilkan:

1. migration
2. model
3. Form Request
4. controller
5. service jika digunakan
6. routes
7. middleware/authorization
8. React page
9. Axios service
10. success page
11. validasi frontend
12. testing
13. langkah migration
14. langkah menjalankan aplikasi
15. contoh request API
16. contoh response API

Sebelum mengubah kode, periksa struktur project yang sudah ada dan **ikuti arsitektur project saat ini**. Jangan membuat file duplikat apabila functionality yang sama sudah tersedia.

Jangan merusak authentication flow yang sudah ada.

Jika ada konflik dengan implementasi existing, prioritaskan solusi yang paling aman dan konsisten dengan Laravel + React + Sanctum.

Gunakan clean code, reusable component, proper error handling, database transaction, authorization, dan prinsip least privilege.

Pastikan seluruh implementasi siap dikembangkan lebih lanjut untuk fitur:

- appointment
- jadwal dokter
- pasien
- konsultasi
- notifikasi
- dashboard dokter
- approval dokter oleh admin
- audit log
- 2FA untuk akun dokter