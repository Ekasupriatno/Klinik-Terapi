# Website Klinik Terapi & Rehabilitasi Medik

[![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.x-FF4154?style=for-the-badge&logo=react-query&logoColor=white)](https://tanstack.com/query)

Aplikasi web full-stack untuk klinik terapi & rehabilitasi medik: reservasi jadwal terapis/dokter, manajemen pasien & wali, catatan sesi terapi, invoice & pembayaran, serta CMS artikel edukasi. Layanan mencakup fisioterapi, terapi okupasi, terapi wicara, akupunktur medis, dan chiropractic.

---

## Daftar Isi

- [Cara Menjalankan](#cara-menjalankan-langkah-demi-langkah)
- [Akun Demo Bawaan](#akun-demo-bawaan)
- [Peran Pengguna](#peran-pengguna)
- [Fitur Utama](#fitur-utama)
- [Struktur Proyek](#struktur-proyek)
- [Skema Database & Entitas](#skema-database--entitas)
- [Pengujian Otomatis](#pengujian-otomatis-automated-testing)
- [Dokumentasi API](#dokumentasi-api)
- [Troubleshooting](#troubleshooting-umum)

---

## Cara Menjalankan (Langkah Demi Langkah)

> **Prasyarat**: Pastikan sudah terinstal:
> - **PHP 8.2+** dan **Composer** (untuk Laravel)
> - **Node.js 18+** dan **npm** (untuk React/Vite)
> - **MySQL/MariaDB** (Laragon atau XAMPP)

### LANGKAH 1 - Setup Backend Laravel

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan storage:link
```

Sesuaikan konfigurasi database di file `backend/.env`:
```env
DB_DATABASE=klinik_terapi
DB_USERNAME=root
DB_PASSWORD=          # kosongkan jika menggunakan Laragon default
FRONTEND_URL=http://localhost:5173
```

> `php artisan storage:link` diperlukan agar foto profil dokter (disimpan di disk `public`) dapat diakses dari browser.

### LANGKAH 2 - Buat Database & Jalankan Migrasi

**a.** Buat database baru bernama `klinik_terapi` melalui phpMyAdmin atau MySQL client.

**b.** Jalankan migrasi dan seeder:
```bash
php artisan migrate --seed
```

### LANGKAH 3 - Setup Frontend React

```bash
cd frontend
npm install
```

### LANGKAH 4 - Jalankan Aplikasi

Buka **tiga jendela terminal**:

**Terminal 1 - Backend API (http://localhost:8000):**
```bash
cd backend
php artisan serve --port=8000
```

**Terminal 2 - Frontend (http://localhost:5173):**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Queue worker (pemrosesan foto dokter di background):**
```bash
cd backend
php artisan queue:work
```

Buka browser ke: http://localhost:5173

---

## Akun Demo Bawaan

| Peran            | Email                        | Kata Sandi         | Halaman Utama                         |
|------------------|------------------------------|--------------------|---------------------------------------|
| Administrator    | admin@klinikterapi.com       | `AdminKlinik!2026` | `/admin` - Dashboard admin            |
| Orang Tua / Wali | parent@gmail.com             | `ParentDemo!2026`  | `/parent` - Portal orang tua          |
| Orang Tua / Wali | pasien@gmail.com             | `PasienDemo!2026`  | `/parent` - Portal orang tua          |
| Terapis          | therapist@klinikterapi.com   | `Therapist!2026`   | `/therapist` - Portal terapis         |

*Catatan: Halaman login dilengkapi tombol 1-klik untuk mengisi akun demo secara otomatis.*

**Kebijakan keamanan:**
- Kata sandi minimal 12 karakter, memuat huruf besar, huruf kecil, angka, dan simbol.
- Login dibatasi maksimal 5 percobaan per kombinasi akun/IP per menit (serta 20 percobaan per IP per menit).
- Perubahan email/kata sandi admin dan pembuatan akun admin baru dibatasi 5 request per menit.

---

## Peran Pengguna

| Peran                   | Keterangan                                                                                      |
|-------------------------|-------------------------------------------------------------------------------------------------|
| `super_admin` / `admin` | Akses penuh ke dashboard admin, termasuk verifikasi dokter & pengaturan klinik                  |
| `parent`                | Orang tua/wali: mengelola profil pasien, membuat reservasi, melihat invoice                     |
| `therapist`             | Terapis internal: dashboard sesi, daftar pasien, catatan sesi, kalender                         |
| `doctor`                | Dokter yang mendaftar mandiri; akses portal terapis **setelah disetujui admin**                 |

---

## Fitur Utama

### Publik
- Beranda, halaman **Layanan**, **Artikel edukasi**, **Kontak**, dan katalog **Dokter/Terapis**
- Halaman kontak dilengkapi **Peta Lokasi Interaktif (Google Maps embed)** serta tombol navigasi langsung ke Google Maps
- Pencarian & filter dokter berdasarkan spesialisasi
- Slot waktu dinamis (real-time availability per tanggal)
- Lupa & reset kata sandi
- **Pendaftaran dokter mandiri** (`/register/doctor`) dengan upload foto profil — status awal *pending* hingga diverifikasi admin

### Orang Tua / Wali (Portal `/parent`)
- Kelola profil wali dan data pasien (tanggal lahir, riwayat medis, alergi)
- Wizard booking: pilih pasien, layanan, dokter, tanggal/slot, keluhan, dan nomor telepon
- Riwayat reservasi dengan filter status (Semua / Mendatang & Aktif / Selesai / Dibatalkan)
- Pembatalan mandiri dengan alasan
- Rating bintang & ulasan setelah sesi selesai
- Daftar & detail invoice

### Terapis / Dokter (Portal `/therapist`)
- Dashboard: jadwal hari ini, sesi mendatang, dan catatan sesi yang belum diisi
- Daftar pasien yang ditangani
- Membuat & memperbarui **catatan sesi** (intervensi, observasi, progres, opsi dibagikan ke wali)
- Kalender janji temu

### Administrator (Dashboard `/admin`)
- **Metrik operasional real-time** (pasien, dokter aktif, total booking, menunggu ACC, reservasi hari ini, selesai)
- **Reservasi (CRUD)**: tambah (pasien terdaftar maupun walk-in), cari, edit, hapus (soft delete), dan ubah status cepat (Approve, Konsultasi, Selesai + catatan dokter, Tolak)
- **Dokter**: CRUD, upload foto, tarif konsultasi, status aktif; **verifikasi pendaftaran** (approve / reject / suspend)
- **Jadwal praktek**: shift harian, jam mulai/selesai, durasi sesi
- **Wali Pasien** & **Data Pasien**: CRUD lengkap
- **Layanan**: CRUD layanan terapi (harga, durasi, target usia)
- **Catatan Sesi**, **Invoice**, dan **Pembayaran**: CRUD lengkap
- **Artikel CMS**: tulis, edit, publikasikan artikel
- **Audit Logs**: jejak aktivitas sensitif (IP & user agent)
- **Pengaturan Klinik**: informasi kontak klinik (alamat, telepon/WhatsApp, dll.)
- **Akun & Keamanan**: ubah email/kata sandi, buat akun admin baru

### Notifikasi In-App
Notifikasi tersimpan di database dan ditampilkan melalui `NotificationContext` di frontend secara real-time:
- Admin: reservasi baru masuk, pendaftaran dokter baru
- Pasien/wali: reservasi dibuat, disetujui, atau dibatalkan
- Dokter/terapis: notifikasi reservasi dan jadwal sesi pasien
- **Manajemen Notifikasi**: badge hitungan belum dibaca, tandai satu/semua dibaca, hapus notifikasi individual, dan hapus semua notifikasi (clear all) untuk seluruh peran (pasien, admin, dan dokter).

### Zero Double-Booking
Pembuatan reservasi menggunakan **pessimistic locking** (`lockForUpdate()`) di dalam `DB::transaction()` sehingga dua pasien tidak dapat memesan slot yang sama secara bersamaan.

---

## Struktur Proyek

```
Klinik_terapi/
├── backend/                          # Laravel 11 RESTful API
│   ├── app/
│   │   ├── Http/Controllers/Api/     # API Controllers (+ Admin/)
│   │   ├── Http/Middleware/          # IsAdmin, IsDoctor, IsTherapist, IsPatient
│   │   ├── Http/Requests/            # Form Request Validation
│   │   ├── Http/Resources/           # API Resources (JSON transformers)
│   │   ├── Jobs/                     # ProcessDoctorImageJob (queue)
│   │   ├── Models/                   # Eloquent Models
│   │   ├── Notifications/            # Notifikasi database (booking, dokter)
│   │   └── Services/                 # Business logic (Booking, SlotEngine, DoctorRegistration)
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/api.php
│   └── tests/Feature/                # Automated feature tests
│
├── frontend/                         # React 18 + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/                # Tab-tab dashboard admin
│   │   │   ├── common/               # Navbar, Footer, Skeleton
│   │   │   └── layout/               # ProtectedRoute
│   │   ├── context/                  # AuthContext, NotificationContext
│   │   ├── pages/                    # Halaman (publik, auth, portal)
│   │   ├── services/                 # API service layer (axios)
│   │   └── utils/                    # Helper (dateUtils)
│   └── package.json
│
├── prd.txt                           # Product Requirements Document
└── README.md
```

---

## Skema Database & Entitas

Struktur database dirancang secara ringkas dan terstandarisasi langsung menggunakan entitas pasien (`patients`):

| Tabel | Relasi & Deskripsi |
|---|---|
| `users` | Akun autentikasi multi-peran (`super_admin`, `admin`, `parent`, `therapist`, `doctor`, `patient`) |
| `guardians` | Profil wali (FK `user_id`, kontak darurat, `relationship_to_patient`) |
| `patients` | Profil pasien rekam medis (FK `guardian_id`, nama, tgl lahir, gender, status, riwayat medis, alergi) |
| `specializations` | Bidang keahlian terapi medis (Fisioterapi, Terapi Wicara, Okupasi, dll.) |
| `doctors` | Dokter/terapis klinis (FK `specialization_id`, FK `user_id`, pengalaman, tarif, status verifikasi) |
| `services` | Katalog paket layanan & terapi (nama, durasi, harga, target usia) |
| `schedules` | Jadwal praktek dokter (FK `doctor_id`, hari, jam mulai/selesai, durasi sesi) |
| `bookings` | Reservasi konsultasi/terapi (FK `patient_id`, `doctor_id`, `service_id`, `user_id`, slot waktu, status) |
| `session_notes` | Rekam catatan sesi terapi (FK `booking_id`, `therapist_id`, observasi, intervensi, rekomendasi) |
| `invoices` | Lembar tagihan biaya sesi (FK `booking_id`, `patient_id`, `guardian_id`, nominal, status) |
| `payments` | Bukti & verifikasi pembayaran (FK `invoice_id`, metode, status) |
| `reviews` | Ulasan & rating pengalaman terapi (FK `booking_id`, `doctor_id`, `user_id`, rating 1-5, komentar) |
| `articles` | Konten edukasi CMS publik (judul, kategori, konten, tags, status publish) |
| `clinic_settings` | Konfigurasi informasi operasional & kontak klinik |
| `audit_logs` | Jejak audit keamanan aktivitas administratif (IP address & user-agent) |
| `notifications` | Notifikasi in-app untuk pembaruan reservasi dan verifikasi dokter |


---

## Pengujian Otomatis (Automated Testing)

Pengujian menggunakan database terpisah **`klinik_terapi_test`** (lihat `backend/phpunit.xml`). Buat database tersebut terlebih dahulu, lalu jalankan:

```bash
cd backend
php artisan test
```

| File Test                          | Cakupan                                                           |
|------------------------------------|-------------------------------------------------------------------|
| `AdminAccountTest`                 | Ubah email/kata sandi admin, pembuatan akun admin                 |
| `AdminBookingCrudTest`             | CRUD reservasi oleh admin (walk-in & pasien terdaftar)            |
| `AdminDoctorCrudTest`              | CRUD dokter beserta upload foto                                   |
| `AdminNotificationTest`            | Notifikasi admin untuk booking, dokter, serta hapus notifikasi    |
| `AdminScheduleCrudTest`            | Jadwal praktek & validasi format waktu                            |
| `AuthenticationSecurityTest`       | Rate limiter, kebijakan kata sandi, pendaftaran                   |
| `BookingWithPhoneTest`             | Zero double-booking, validasi nomor telepon, alur status          |
| `ClinicSettingTest`                | Pengaturan informasi klinik                                       |
| `DoctorRegistrationTest`           | Pendaftaran dokter mandiri & alur approval                        |
| `LoginTest`                        | Login & token                                                     |
| `PatientBookingNotificationTest`   | Notifikasi reservasi ke pasien                                    |

> **Status Test Suite**: 69 feature & unit tests lulus 100% (311 assertions).

---

## Dokumentasi API

Base URL: `http://localhost:8000/api` — autentikasi menggunakan **Bearer token (Laravel Sanctum)**.

### Publik

| Method | Endpoint                                  | Deskripsi                                   |
|--------|-------------------------------------------|---------------------------------------------|
| POST   | /auth/register                            | Daftar akun orang tua/wali                  |
| POST   | /auth/register/doctor                     | Pendaftaran dokter mandiri (rate-limited)   |
| POST   | /auth/login                               | Login & peroleh token (rate-limited)        |
| POST   | /auth/forgot-password                     | Kirim tautan reset kata sandi               |
| POST   | /auth/reset-password                      | Reset kata sandi dengan token               |
| GET    | /specializations                          | Daftar spesialisasi terapi                  |
| GET    | /doctors                                  | Katalog dokter (filter & search)            |
| GET    | /doctors/{id}                             | Detail dokter & jadwal                      |
| GET    | /doctors/{id}/available-slots?date=Y-m-d  | Slot tersedia per tanggal                   |
| GET    | /schedules/doctor/{id}                    | Jadwal praktek dokter                       |
| GET    | /services, /services/{id}                 | Daftar & detail layanan                     |
| GET    | /articles, /articles/{id}                 | Daftar & detail artikel                     |
| GET    | /settings                                 | Informasi kontak klinik                     |

### Terautentikasi

| Method | Endpoint                               | Deskripsi                                        |
|--------|----------------------------------------|--------------------------------------------------|
| GET    | /auth/me                               | Profil pengguna yang login                       |
| POST   | /auth/logout                           | Logout & hapus token                             |
| GET    | /notifications                         | Daftar notifikasi                                |
| PUT    | /notifications/{id}/read               | Tandai notifikasi dibaca                         |
| PUT    | /notifications/mark-all-read           | Tandai semua notifikasi dibaca                   |
| DELETE | /notifications/{id}                    | Hapus notifikasi tertentu milik pengguna         |
| DELETE | /notifications                         | Hapus semua notifikasi milik pengguna            |
| GET    | /bookings                              | Daftar booking (wali: milik sendiri; admin: semua) |
| POST   | /bookings                              | Buat reservasi (transaksi & lock)                |
| GET    | /bookings/{id}                         | Detail reservasi                                 |
| PUT    | /bookings/{id}/cancel                  | Batalkan reservasi dengan alasan                 |
| POST   | /reviews                               | Kirim ulasan & rating                            |
| GET/PUT| /guardian/me                           | Lihat/ubah profil wali                           |
| GET/POST | /patients                               | Daftar/tambah data pasien                        |
| GET/PUT  | /patients/{id}                          | Detail/ubah data pasien                          |
| GET      | /invoices, /invoices/{id}               | Daftar & detail invoice milik sendiri            |

### Terapis (`/therapist/*`) & Dokter (`/doctor/*`)

| Method   | Endpoint                         | Deskripsi                                  |
|----------|----------------------------------|--------------------------------------------|
| GET      | /therapist/dashboard             | Ringkasan jadwal & catatan tertunda        |
| GET      | /therapist/patients              | Pasien yang ditangani                      |
| GET/POST | /therapist/session-notes         | Daftar/buat catatan sesi                   |
| PUT      | /therapist/session-notes/{id}    | Perbarui catatan sesi                      |
| GET      | /therapist/calendar              | Kalender janji temu                        |
| GET      | /doctor/{dashboard,patients,session-notes,calendar} | Endpoint setara untuk dokter yang sudah disetujui |
| GET      | /doctor/profile                  | Profil dokter yang login                   |

### Admin (`/admin/*`)

| Method          | Endpoint                                   | Deskripsi                                   |
|-----------------|--------------------------------------------|---------------------------------------------|
| GET             | /admin/stats                               | Statistik dashboard                         |
| POST            | /admin/accounts/admin                      | Buat akun admin baru                        |
| PUT             | /admin/account/email, /admin/account/password | Ubah email / kata sandi admin            |
| GET             | /admin/doctors/pending                     | Daftar pendaftaran dokter tertunda          |
| PUT             | /admin/doctors/{id}/approve \| reject \| suspend | Verifikasi pendaftaran dokter         |
| GET/POST        | /admin/doctors                             | Daftar semua dokter / tambah dokter         |
| PUT/DELETE      | /admin/doctors/{id}                        | Ubah / hapus dokter (soft delete)           |
| GET             | /admin/therapist-accounts                  | Akun terapis yang dapat ditautkan           |
| POST/PUT/DELETE | /admin/schedules[/{id}]                    | Kelola jadwal praktek                       |
| GET             | /admin/patient-accounts                    | Daftar akun pasien/wali untuk dropdown      |
| CRUD            | /admin/patients                            | Manajemen data rekam medis pasien           |
| POST            | /admin/bookings                            | Tambah reservasi (terdaftar / walk-in)      |
| PUT/DELETE      | /admin/bookings/{id}                       | Ubah / hapus reservasi                      |
| PUT             | /admin/bookings/{id}/status                | Ubah status & catatan konsultasi            |
| CRUD            | /admin/guardians                           | Manajemen wali                              |
| CRUD            | /admin/services                            | Manajemen layanan                           |
| CRUD            | /admin/session-notes                       | Manajemen catatan sesi                      |
| CRUD            | /admin/invoices                            | Manajemen invoice                           |
| CRUD            | /admin/payments                            | Manajemen pembayaran                        |
| CRUD            | /admin/articles                            | CMS artikel                                 |
| GET/DELETE      | /admin/audit-logs[/{id}]                   | Lihat / hapus audit log                     |
| GET/PUT         | /admin/settings                            | Pengaturan informasi klinik                 |

---

## Troubleshooting Umum

**`Could not open input file: artisan`**
→ Pastikan berada di folder `backend/` dan sudah menjalankan `composer install`.

**`SQLSTATE: Unknown database 'klinik_terapi'`** (atau `klinik_terapi_test` saat testing)
→ Buat database tersebut di phpMyAdmin terlebih dahulu.

**`Access denied for user 'root'`**
→ Pastikan MySQL berjalan. Cek username dan password di `backend/.env`.

**Foto dokter tidak muncul**
→ Jalankan `php artisan storage:link` dan pastikan `php artisan queue:work` aktif.

**`npm : File cannot be loaded... scripts disabled`**
→ Gunakan `npm.cmd` di PowerShell, atau gunakan Command Prompt/Git Bash.

**Port 8000 atau 5173 sudah terpakai**
→ Gunakan `--port=8001` pada backend atau ubah konfigurasi di `frontend/vite.config.js`.

---

## Daftar Layanan & Tarif Resmi (Rumah Terapi Al Abina)

Layanan konseling, terapi okupasi, wicara, orthopedagog, dan psikotes sesuai tarif resmi klinik:

| No | Layanan | Biaya (IDR) | Keterangan & Fasilitas |
|:---|:---|:---|:---|
| 1 | **Terapi Okupasi** | Rp 150.000 | 45' terapi + 15' report |
| 2 | **Terapi Wicara** | Rp 150.000 | 45' terapi + 15' report |
| 3 | **Orthopedagog** | Rp 150.000 | 45' terapi + 15' report |
| 4 | **Brain Assessment** | Rp 350.000 | Screening + 1 Konsultasi dengan dokter |
| 5 | **Paket Terapi Gelombang Suara (8x Pertemuan)** | Rp 3.000.000 | 8x terapi + 1 Konsultasi dengan dokter *(Diskon 20% &rarr; Rp 2.400.000 dengan follow IG @rumahterapi_alabina / TikTok @rumahterapi.alabina)* |
| 6 | **Konseling Individu (Pasien & Dewasa)** | Rp 250.000 | Persesi Max 75' (Penambahan sesi = 50.000 / 30') |
| 7 | **Konseling Pasangan** | Rp 400.000 | Tanpa Laporan |
| 8 | **Psikotes FULL (Konsul + Laporan)** | Rp 450.000 | Laporan Psikogram resmi |
| 9 | **Psikotes Minat Bakat (Dengan Konsultasi)** | Rp 450.000 | + Laporan (Dengan Konsultasi) |
| 10 | **Psikotes Minat Bakat (Tanpa Konsultasi)** | Rp 275.000 | + Laporan (Tanpa Konsultasi) |
| 11 | **Tes Kecerdasan (Dengan Konsultasi)** | Rp 425.000 | + Laporan (dengan konsultasi) |
| 12 | **Tes Kecerdasan (Tanpa Konsultasi)** | Rp 275.000 | + Laporan (tanpa konsultasi) |
| 13 | **Assesment Intelegensi Pasien** | Rp 375.000 | + Laporan (dengan konsultasi hasil tes) |
| 14 | **Assesment Paket Kematangan Sekolah Dasar** | Rp 550.000 | + Laporan (dengan konsultasi) |
| 15 | **Assesment Tumbuh Kembang (Tanpa Konsultasi)** | Rp 350.000 | + Laporan (tanpa konsultasi) |
| 16 | **Assesment Tumbuh Kembang (Dengan Konsultasi)** | Rp 600.000 | + Laporan (dengan konsultasi) |
| 17 | **Administrasi** | Rp 25.000 | Per Pertemuan |

---

## Tech Stack

- **Backend**: Laravel 11, Laravel Sanctum, MySQL, Database Queue & Notifications
- **Frontend**: React 18, Vite 5, Tailwind CSS 3, TanStack Query 5, React Router 6, Axios, date-fns, lucide-react
- **Architecture**: RESTful API, Service Layer Pattern, Role-based Middleware, Pessimistic Locking, Audit Logging
