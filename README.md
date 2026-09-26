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

Buka browser ke: http://localhost:5173

---

## Akun Demo Bawaan

| Peran         | Email                     | Kata Sandi   | Akses                           |
|---------------|---------------------------|--------------|---------------------------------|
| Administrator | admin@klinikterapi.com    | admin12345   | Dashboard Admin, kelola dokter  |
| Pasien Demo   | pasien@gmail.com          | pasien12345  | Booking, riwayat, ulasan        |

*Catatan: Halaman login dilengkapi tombol 1-klik untuk mengisi akun demo secara otomatis.*

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
- Katalog dan pencarian dokter berdasarkan spesialisasi terapi
- Pemilihan slot waktu dinamis (real-time availability per tanggal)
- Wizard booking 4-langkah (pilih dokter, tanggal/slot, keluhan, konfirmasi)
- Riwayat reservasi dengan filter status (Aktif / Selesai / Dibatalkan)
- Pembatalan mandiri dengan alasan
- Rating bintang & ulasan dokter setelah sesi selesai
- Notifikasi WhatsApp otomatis berisi detail booking

**Administrator:**
- Dashboard metrik operasional harian
- Approval/penolakan booking pasien
- Pencatatan hasil terapi & catatan medis
- Manajemen data dokter (tambah, edit, hapus)
- Konfigurasi shift jam praktek per hari

---

## Mekanisme Zero Double-Booking

Sistem menggunakan **pessimistic locking** (`lockForUpdate()`) dalam `DB::transaction()` sehingga tidak ada dua pasien yang bisa memesan slot yang sama secara bersamaan.

---

## Dokumentasi API

Base URL: `http://localhost:8000/api`

| Method | Endpoint                                    | Akses    | Deskripsi                        |
|--------|---------------------------------------------|----------|----------------------------------|
| POST   | /auth/register                              | Publik   | Daftar akun pasien               |
| POST   | /auth/login                                 | Publik   | Login dan dapat Bearer token     |
| GET    | /specializations                            | Publik   | Daftar spesialisasi terapi       |
| GET    | /doctors                                    | Publik   | Katalog dokter (filter & search) |
| GET    | /doctors/{id}/available-slots?date=Y-m-d    | Publik   | Slot waktu tersedia              |
| GET    | /bookings                                   | Auth     | Riwayat booking                  |
| POST   | /bookings                                   | Pasien   | Buat reservasi baru              |
| PUT    | /bookings/{id}/cancel                       | Auth     | Batalkan reservasi               |
| POST   | /reviews                                    | Pasien   | Kirim ulasan dokter              |
| GET    | /admin/stats                                | Admin    | Statistik operasional            |
| POST   | /admin/doctors                              | Admin    | Tambah dokter                    |
| PUT    | /admin/bookings/{id}/status                 | Admin    | Update status booking            |

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