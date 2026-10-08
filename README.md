# Website Klinik Terapi & Rehabilitasi Medik

[![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.x-FF4154?style=for-the-badge&logo=react-query&logoColor=white)](https://tanstack.com/query)

Aplikasi web full-stack modern untuk manajemen reservasi jadwal dokter spesialis terapi, rehabilitasi medik, fisioterapi, okupasi, terapi wicara, akupunktur medis, dan chiropractic.

---

## Cara Menjalankan (Langkah Demi Langkah)

> **Prasyarat**: Pastikan sudah terinstal:
> - **PHP 8.2+** dan **Composer** (untuk Laravel)
> - **Node.js 18+** dan **npm** (untuk React/Vite)
> - **MySQL/MariaDB** (Laragon atau XAMPP)

---

### LANGKAH 1 - Setup Backend Laravel

Buka terminal di folder `backend/`:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Sesuaikan konfigurasi database di file `backend/.env`:
```env
DB_DATABASE=klinik_terapi
DB_USERNAME=root
DB_PASSWORD= (kosongkan jika menggunakan Laragon default)
```

---

### LANGKAH 2 - Buat Database & Jalankan Migrasi

**a.** Buat database baru bernama `klinik_terapi` melalui phpMyAdmin atau MySQL client.

**b.** Jalankan migrasi dan seeder di folder `backend/`:
```bash
php artisan migrate --seed
```

---

### LANGKAH 3 - Setup Frontend React

Buka terminal baru di folder `frontend/`:

```bash
cd frontend
npm install
```

---

### LANGKAH 4 - Jalankan Aplikasi

Buka **dua jendela terminal** secara bersamaan:

**Terminal 1 - Backend (http://localhost:8000):**
```bash
cd backend
php artisan serve --port=8000
```

**Terminal 2 - Frontend (http://localhost:5173):**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Background image processing:**
```bash
cd backend
php artisan queue:work
```

Buka browser ke: http://localhost:5173

---

## Akun Demo Bawaan

| Peran         | Email                     | Kata Sandi   | Akses                           |
|---------------|---------------------------|--------------|---------------------------------|
| Administrator | admin@klinikterapi.com    | AdminKlinik!2026 | Dashboard Admin, kelola dokter  |
| Pasien Demo   | pasien@gmail.com          | PasienDemo!2026 | Booking, riwayat, ulasan        |

*Catatan: Halaman login dilengkapi tombol 1-klik untuk mengisi akun demo secara otomatis.*

Kata sandi pendaftaran harus minimal 12 karakter serta memuat huruf besar, huruf kecil, angka, dan simbol. Login dibatasi maksimal 5 percobaan per kombinasi akun/IP setiap menit (serta 20 percobaan per IP per menit).

---

## Struktur Proyek

```
Klinik_terapi/
├── backend/              # Laravel 11 RESTful API
│   ├── app/
│   │   ├── Http/Controllers/Api/    # API Controllers
│   │   ├── Http/Middleware/          # Auth & Admin middleware
│   │   ├── Http/Requests/            # Form Request Validation
│   │   ├── Http/Resources/          # API Resources (JSON transformers)
│   │   ├── Models/                   # Eloquent Models
│   │   └── Services/                 # Business Logic Layer
│   ├── database/
│   │   ├── migrations/               # Database migrations
│   │   └── seeders/                  # Database seeders
│   ├── routes/api.php                # API routes
│   └── .env                          # Environment configuration
│
├── frontend/             # React 18 + Vite SPA
│   ├── src/
│   │   ├── components/              # React components
│   │   ├── context/                  # React Context (Auth)
│   │   ├── services/                 # API service layer
│   │   └── pages/                    # Page components
│   ├── public/                      # Static assets
│   └── package.json                 # Node dependencies
│
└── README.md
```

---

## Fitur Utama

**Pasien:**
- Katalog dan pencarian dokter berdasarkan spesialisasi terapi1
- Pemilihan slot waktu dinamis (real-time availability per tanggal)
- Wizard booking 4-langkah (pilih dokter, tanggal/slot, keluhan, nomor WhatsApp/telepon, konfirmasi)
- Riwayat reservasi dengan filter status (Aktif / Selesai / Dibatalkan)
- Pembatalan mandiri dengan alasan pembatalan
- Rating bintang & ulasan dokter setelah sesi selesai
- Notifikasi WhatsApp otomatis berisi detail booking

**Administrator:**
- **Dashboard Metrik Operasional Real-time** (Total Pasien, Dokter Aktif, Total Booking, Menunggu ACC, Reservasi Hari Ini, Selesai)
- **Manajemen & CRUD Lengkap Reservasi Pasien**:
  - **Create**: Tambah reservasi baru langsung dari dashboard (mendukung pasien terdaftar maupun pasien walk-in/baru)
  - **Read**: Pencarian kode/nama pasien, filter status lengkap, dan modal detail informasi pasien & catatan medis
  - **Update**: Edit dokter, tanggal, jam konsultasi, nomor telepon, keluhan, catatan medis, dan status reservasi
  - **Delete**: Hapus data reservasi pasien dengan konfirmasi aman (soft delete)
  - **Quick Status**: Akses cepat ubah status (Approve, Konsultasi, Selesai dengan catatan dokter, Tolak)
- **Manajemen Data Dokter (CRUD)**: Tambah dokter baru, upload foto profil, atur SIP, tarif konsultasi, dan status aktif
- **Konfigurasi Jadwal Jam Praktek (CRUD)**: Kelola shift praktek harian dokter, jam mulai/selesai, dan durasi per sesi

---

## Mekanisme Zero Double-Booking

Sistem menggunakan **pessimistic locking** (`lockForUpdate()`) dalam `DB::transaction()` sehingga tidak ada dua pasien yang bisa memesan slot yang sama secara bersamaan.

---

## Pengujian Otomatis (Automated Testing)

Backend dilengkapi dengan rangkaian Automated Feature Tests menggunakan Pest/PHPUnit:

```bash
cd backend
php artisan test
```

Mencakup **30 pengujian (130 assertions)** untuk:
- `AdminBookingCrudTest`: Validasi lengkap CRUD reservasi oleh admin (create walk-in & existing, update, delete, daftar pasien).
- `AdminDoctorCrudTest`: Validasi CRUD dokter beserta upload media foto.
- `AdminScheduleCrudTest`: Validasi jam kerja dokter dan proteksi format waktu.
- `BookingWithPhoneTest`: Validasi zero double-booking, nomor telepon, dan status flow.
- `LoginTest` & `AuthenticationSecurityTest`: Proteksi rate limiter dan enkripsi password.

---

## Dokumentasi API

Base URL: `http://localhost:8000/api`

| Method | Endpoint                                    | Akses    | Deskripsi                                                 |
|--------|---------------------------------------------|----------|-----------------------------------------------------------|
| POST   | /auth/register                              | Publik   | Daftar akun pasien baru                                   |
| POST   | /auth/login                                 | Publik   | Login dan peroleh Bearer token (rate-limited)             |
| GET    | /auth/me                                    | Auth     | Ambil data profil pengguna yang sedang login              |
| POST   | /auth/logout                                | Auth     | Logout dan hapus token aktif                              |
| GET    | /specializations                            | Publik   | Daftar spesialisasi terapi                                |
| GET    | /doctors                                    | Publik   | Katalog dokter publik (filter & search)                   |
| GET    | /doctors/{id}                               | Publik   | Detail profil dokter & jadwal                             |
| GET    | /doctors/{id}/available-slots?date=Y-m-d    | Publik   | Slot waktu tersedia per tanggal                           |
| GET    | /bookings                                   | Auth     | Daftar booking (Pasien: milik sendiri; Admin: semua)      |
| POST   | /bookings                                   | Pasien   | Buat reservasi baru (dengan transaksi & lock)             |
| GET    | /bookings/{id}                              | Auth     | Detail reservasi tertentu                                 |
| PUT    | /bookings/{id}/cancel                       | Auth     | Batalkan reservasi dengan alasan                          |
| POST   | /reviews                                    | Pasien   | Kirim ulasan dan rating bintang dokter                    |
| GET    | /admin/stats                                | Admin    | Statistik dan ringkasan metrik dashboard admin            |
| GET    | /admin/patients                             | Admin    | Daftar pasien untuk dropdown admin                        |
| POST   | /admin/bookings                             | Admin    | Tambah reservasi baru (pasien terdaftar / walk-in)        |
| PUT    | /admin/bookings/{id}                        | Admin    | Perbarui detail reservasi pasien                          |
| PUT    | /admin/bookings/{id}/status                 | Admin    | Update status booking & catatan hasil konsultasi          |
| DELETE | /admin/bookings/{id}                        | Admin    | Hapus data reservasi pasien                               |
| GET    | /admin/doctors                              | Admin    | Daftar semua dokter (termasuk status nonaktif)            |
| POST   | /admin/doctors                              | Admin    | Tambah data dokter baru                                   |
| PUT    | /admin/doctors/{id}                         | Admin    | Perbarui data dokter                                      |
| DELETE | /admin/doctors/{id}                         | Admin    | Hapus data dokter (soft delete)                           |
| POST   | /admin/schedules                            | Admin    | Tambah jadwal shift dokter                                |
| PUT    | /admin/schedules/{id}                       | Admin    | Perbarui jadwal shift dokter                              |
| DELETE | /admin/schedules/{id}                       | Admin    | Hapus jadwal shift dokter                                 |

---

## Troubleshooting Umum

**`Could not open input file: artisan`**
→ Pastikan berada di folder `backend/` dan sudah menjalankan `composer install`.

**`SQLSTATE: Unknown database 'klinik_terapi'`**
→ Buat database `klinik_terapi` di phpMyAdmin terlebih dahulu.

**`Access denied for user 'root'`**
→ Pastikan MySQL sudah berjalan. Cek username dan password di `backend/.env`.

**`npm : File cannot be loaded... scripts disabled`**
→ Gunakan `npm.cmd` secara manual di PowerShell, atau gunakan Command Prompt/Git Bash.

**Port 8000 atau 5173 sudah terpakai**
→ Ganti port dengan menambah parameter `--port=8001` pada backend atau mengubah konfigurasi di `frontend/vite.config.js`.

---

## Tech Stack

- **Backend**: Laravel 11, Sanctum, MySQL
- **Frontend**: React 18, Vite, Tailwind CSS, TanStack Query
- **Architecture**: RESTful API, Service Layer Pattern, Pessimistic Locking
