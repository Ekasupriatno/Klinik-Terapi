<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Booking;
use App\Models\Doctor;
use App\Models\Guardian;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Patient;
use App\Models\Review;
use App\Models\Schedule;
use App\Models\Service;
use App\Models\Specialization;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Akun Admin & Pasien Demo
        $admin = User::firstOrCreate(
            ['email' => 'admin@klinikterapi.com'],
            [
                'name' => 'Administrator Klinik',
                'phone' => '081234567890',
                'password' => Hash::make('AdminKlinik!2026'),
                'role' => 'admin',
            ]
        );

        $parent = User::firstOrCreate(
            ['email' => 'parent@gmail.com'],
            [
                'name' => 'Budi Santoso',
                'phone' => '089876543210',
                'password' => Hash::make('ParentDemo!2026'),
                'role' => 'parent',
            ]
        );

        $pasien = User::firstOrCreate(
            ['email' => 'pasien@gmail.com'],
            [
                'name' => 'Pasien Demo (Wali)',
                'phone' => '081234567899',
                'password' => Hash::make('PasienDemo!2026'),
                'role' => 'parent',
            ]
        );

        $therapistUser = User::firstOrCreate(
            ['email' => 'therapist@klinikterapi.com'],
            [
                'name' => 'dr. Hendra Wijaya, Sp.KFR',
                'phone' => '081234567800',
                'password' => Hash::make('Therapist!2026'),
                'role' => 'therapist',
            ]
        );

        // Create guardian profile for parent
        $guardian = Guardian::firstOrCreate(
            ['user_id' => $parent->id],
            [
                'phone' => '089876543210',
                'address' => 'Jl. Merdeka No. 123, Jakarta',
                'emergency_contact' => 'Siti Santoso',
                'emergency_phone' => '081234567891',
                'relationship_to_patient' => 'parent',
            ]
        );

        $guardianPasien = Guardian::firstOrCreate(
            ['user_id' => $pasien->id],
            [
                'phone' => '081234567899',
                'address' => 'Jl. Mawar No. 45, Jakarta Selatan',
                'emergency_contact' => 'Dewi Lestari',
                'emergency_phone' => '081298765432',
                'relationship_to_patient' => 'parent',
            ]
        );

        // Create patient record
        $patient = Patient::firstOrCreate(
            [
                'guardian_id' => $guardian->id,
                'name' => 'Andi Santoso',
            ],
            [
                'birth_date' => '2018-05-15',
                'gender' => 'male',
                'status' => 'active',
                'medical_history' => 'Tidak ada riwayat penyakit berat',
                'allergies' => 'Tidak ada',
            ]
        );

        Patient::firstOrCreate(
            [
                'guardian_id' => $guardianPasien->id,
                'name' => 'Dinda Putri',
            ],
            [
                'birth_date' => '2019-08-10',
                'gender' => 'female',
                'status' => 'active',
                'medical_history' => 'Speech delay ringan',
                'allergies' => 'Alergi dingin',
            ]
        );

        // 2. Spesialisasi Terapi
        $specializationsData = [
            [
                'name' => 'Fisioterapi & Rehabilitasi Fisik',
                'slug' => 'fisioterapi',
                'icon' => 'Activity',
                'description' => 'Penanganan cedera otot, pemulihan pasca operasi, stroke, dan pemulihan mobilitas sendi.',
            ],
            [
                'name' => 'Terapi Okupasi (Sensori & Motorik)',
                'slug' => 'terapi-okupasi',
                'icon' => 'HandHeart',
                'description' => 'Membantu pasien mandiri dalam aktivitas fungsional sehari-hari dan tumbuh kembang anak.',
            ],
            [
                'name' => 'Terapi Wicara & Bahasa',
                'slug' => 'terapi-wicara',
                'icon' => 'MessageSquareHeart',
                'description' => 'Penanganan gangguan berbicara, artikulasi, afasia stroke, dan keterlambatan bicara (speech delay).',
            ],
            [
                'name' => 'Akupunktur Medis & Nyeri Kronis',
                'slug' => 'akupunktur-medis',
                'icon' => 'Sparkles',
                'description' => 'Terapi jarum medis steril untuk peredaran darah, pereda nyeri saraf, insomnia, dan migrain.',
            ],
            [
                'name' => 'Chiropractic & Terapi Tulang Belakang',
                'slug' => 'chiropractic',
                'icon' => 'ShieldCheck',
                'description' => 'Koreksi postur, saraf kejepit (HNP), nyeri leher dan punggung akibat aktivitas duduk lama.',
            ],
            [
                'name' => 'Orthopedagog (Pendidikan Khusus)',
                'slug' => 'orthopedagog',
                'icon' => 'BookOpen',
                'description' => 'Pendampingan khusus dan terapi pedagogis untuk membantu perkembangan belajar serta potensi anak.',
            ],
            [
                'name' => 'Konseling & Psikologi',
                'slug' => 'konseling-psikologi',
                'icon' => 'Users',
                'description' => 'Layanan konseling psikologi individual, pasien, dewasa, dan pasangan untuk kesehatan mental terpadu.',
            ],
            [
                'name' => 'Psikotes & Asesmen Tumbuh Kembang',
                'slug' => 'psikotes-asesmen',
                'icon' => 'FileText',
                'description' => 'Pemeriksaan psikotes lengkap, tes kecerdasan (IQ), minat bakat, dan evaluasi tumbuh kembang berkala.',
            ],
        ];

        $specializations = [];
        foreach ($specializationsData as $item) {
            $specializations[$item['slug']] = Specialization::firstOrCreate(
                ['slug' => $item['slug']],
                $item
            );
        }

        // 3. Data Dokter Terapi
        $doctorsData = [
            [
                'specialization_id' => $specializations['fisioterapi']->id,
                'name' => 'dr. Hendra Wijaya, Sp.KFR',
                'title' => 'Spesialis Kedokteran Fisik & Rehabilitasi',
                'experience_years' => 9,
                'consultation_fee' => 250000,
                'bio' => 'Berpengalaman menangani atlet profesional, cedera ligamen (ACL), dan rehabilitasi pasca stroke. Lulusan terbaik FK UI dengan pelatihan khusus di Jerman untuk rehabilitasi olahraga. Menggunakan pendekatan terapi manual dan exercise therapy berbasis evidence-based medicine.',
                'image_url' => 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
                'is_active' => true,
            ],
            [
                'specialization_id' => $specializations['chiropractic']->id,
                'name' => 'dr. Anita Larasati, DC, M.Biomed',
                'title' => 'Doctor of Chiropractic & Spine Specialist',
                'experience_years' => 7,
                'consultation_fee' => 300000,
                'bio' => 'Fokus penanganan postur scoliosis, frozen shoulder, dan saraf kejepit tulang belakang tanpa operasi. Bersertifikat International Chiropractic Association dengan spesialisasi koreksi postur dan rehabilitasi tulang belakang menggunakan metode Gonstead dan Activator.',
                'image_url' => 'https://images.unsplash.com/photo-1594824813624-912b7746cb98?w=400&auto=format&fit=crop&q=80',
                'is_active' => true,
            ],
            [
                'specialization_id' => $specializations['terapi-wicara']->id,
                'name' => 'Siti Nurhaliza, S.Tr.Kes (Terapi Wicara)',
                'title' => 'Terapis Wicara Senior',
                'experience_years' => 6,
                'consultation_fee' => 180000,
                'bio' => 'Berpengalaman mendampingi anak dengan keterlambatan bicara (speech delay) dan orang dewasa paska stroke. Lulusan Poltekkes Jakarta dengan sertifikasi PROMPT untuk terapi motorik oral dan Hanen untuk intervensi komunikasi anak.',
                'image_url' => 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
                'is_active' => true,
            ],
            [
                'specialization_id' => $specializations['akupunktur-medis']->id,
                'name' => 'dr. Kevin Pratama, Sp.Ak',
                'title' => 'Spesialis Akupunktur Medik',
                'experience_years' => 10,
                'consultation_fee' => 220000,
                'bio' => 'Menerapkan akupunktur medis modern berbasis neurofisiologi untuk pengobatan migrain, bells palsy, dan insomnia. Dokter spesialis akupunktur medik dengan pelatihan di Beijing TCM Hospital, bersertifikat PPAKI dan memberikan terapi integratif untuk nyeri kronis.',
                'image_url' => 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
                'is_active' => true,
            ],
            [
                'specialization_id' => $specializations['terapi-okupasi']->id,
                'name' => 'Rina Amalia, S.Tr.Kes (Terapi Okupasi)',
                'title' => 'Terapis Okupasi Anak & Dewasa',
                'experience_years' => 5,
                'consultation_fee' => 200000,
                'bio' => 'Spesialis terapi okupasi untuk anak dengan kebutuhan khusus (autism, ADHD) dan rehabilitasi fungsi tangan pasca cedera. Bersertifikat SIOTA dan memberikan intervensi sensory integration serta aktivitas kehidupan sehari-hari untuk pasien stroke dan demensia.',
                'image_url' => 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80',
                'is_active' => true,
            ],
        ];

        $doctors = [];
        foreach ($doctorsData as $docItem) {
            $doc = Doctor::firstOrCreate(['name' => $docItem['name']], $docItem);
            $doctors[] = $doc;

            // 4. Jadwal Dokter (Senin - Sabtu)
            $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            foreach ($days as $day) {
                Schedule::firstOrCreate(
                    [
                        'doctor_id' => $doc->id,
                        'day_of_week' => $day,
                        'start_time' => '09:00:00',
                    ],
                    [
                        'end_time' => '15:00:00',
                        'slot_duration_minutes' => 30,
                        'max_quota_per_slot' => 1,
                        'is_active' => true,
                    ]
                );
            }
        }
        if ($doctors !== [] && $doctors[0]->user_id === null) {
            $doctors[0]->update(['user_id' => $therapistUser->id]);
        }

        // 5. Services - Daftar Biaya Jasa Layanan Konseling & Terapi Rumah Terapi Al Abina
        $servicesData = [
            // 1. Terapi Okupasi
            [
                'specialization_id' => $specializations['terapi-okupasi']->id,
                'name' => 'Terapi Okupasi',
                'description' => 'Terapi sensori integrasi dan kemandirian motorik fungsional: 45 menit intervensi terapi langsung + 15 menit laporan evaluasi perkembangan pasien.',
                'duration_minutes' => 60,
                'price' => 150000,
                'age_target' => 'Semua usia',
                'benefits' => "45' terapi + 15' report. Membantu kemandirian fisik, koordinasi motorik, dan respon sensori.",
                'show_price' => true,
                'is_active' => true,
            ],
            // 2. Terapi Wicara
            [
                'specialization_id' => $specializations['terapi-wicara']->id,
                'name' => 'Terapi Wicara',
                'description' => 'Terapi wicara dan stimulasi kemampuan bahasa: 45 menit sesi terapi langsung + 15 menit laporan evaluasi sesi.',
                'duration_minutes' => 60,
                'price' => 150000,
                'age_target' => 'Semua usia',
                'benefits' => "45' terapi + 15' report. Mengoptimalkan kemampuan artikulasi, pemahaman bahasa, dan komunikasi verbal.",
                'show_price' => true,
                'is_active' => true,
            ],
            // 3. Orthopedagog
            [
                'specialization_id' => $specializations['orthopedagog']->id,
                'name' => 'Orthopedagog',
                'description' => 'Terapi pendidikan luar biasa dan pendampingan belajar khusus: 45 menit terapi + 15 menit laporan hasil sesi.',
                'duration_minutes' => 60,
                'price' => 150000,
                'age_target' => 'Semua usia',
                'benefits' => "45' terapi + 15' report. Pendampingan hambatan belajar, konsentrasi, dan bimbingan akademik adaptif.",
                'show_price' => true,
                'is_active' => true,
            ],
            // 4. Brain Assessment
            [
                'specialization_id' => $specializations['fisioterapi']->id,
                'name' => 'Brain Assessment',
                'description' => 'Pemeriksaan screening neurofisiologi otak menyeluruh ditambah 1 sesi konsultasi mendalam dengan dokter spesialis.',
                'duration_minutes' => 60,
                'price' => 350000,
                'age_target' => 'Semua usia',
                'benefits' => 'Screening + 1 Konsultasi dengan dokter. Pemetaan gelombang otak dan fungsi neurologis.',
                'show_price' => true,
                'is_active' => true,
            ],
            // 5. Paket Terapi Gelombang Suara 8xPertemuan
            [
                'specialization_id' => $specializations['fisioterapi']->id,
                'name' => 'Paket Terapi Gelombang Suara (8x Pertemuan)',
                'description' => 'Paket intensif terapi neuroakustik gelombang suara sebanyak 8 kali pertemuan + 1 sesi konsultasi dokter. (Promo diskon 20% menjadi IDR 2.400.000 dengan follow Instagram @rumahterapi_alabina dan TikTok @rumahterapi.alabina).',
                'duration_minutes' => 60,
                'price' => 3000000,
                'age_target' => 'Semua usia',
                'benefits' => '8x terapi + 1 Konsultasi dengan dokter. Promo disc 20% -> IDR 2.400.000 via follow medsos.',
                'show_price' => true,
                'is_active' => true,
            ],
            // 6. Konseling Individu (Pasien & Dewasa)
            [
                'specialization_id' => $specializations['konseling-psikologi']->id,
                'name' => 'Konseling Individu (Pasien & Dewasa)',
                'description' => 'Sesi konseling psikologis personal dan kesehatan mental untuk pasien anak maupun dewasa. Durasi maksimal 75 menit (penambahan sesi: IDR 50.000 / 30 menit).',
                'duration_minutes' => 75,
                'price' => 250000,
                'age_target' => 'Pasien & Dewasa',
                'benefits' => "Persesi Max 75'. Penambahan sesi = 50.000/30'. Konseling mendalam dengan konselor profesional.",
                'show_price' => true,
                'is_active' => true,
            ],
            // 7. Konseling Pasangan
            [
                'specialization_id' => $specializations['konseling-psikologi']->id,
                'name' => 'Konseling Pasangan',
                'description' => 'Sesi konseling pernikahan, komunikasi, dan resolusi konflik relasi untuk pasangan suami istri (tanpa laporan tertulis).',
                'duration_minutes' => 75,
                'price' => 400000,
                'age_target' => 'Dewasa / Pasangan',
                'benefits' => 'Tanpa Laporan. Membantu komunikasi harmonis dan penyelesaian konflik keluarga.',
                'show_price' => true,
                'is_active' => true,
            ],
            // 8. Psikotes FULL (Konsul + Laporan)
            [
                'specialization_id' => $specializations['psikotes-asesmen']->id,
                'name' => 'Psikotes FULL (Konsul + Laporan)',
                'description' => 'Pemeriksaan psikologis komprehensif mencakup instrumen psikotes lengkap, laporan resmi psikogram, dan sesi konsultasi hasil evaluasi.',
                'duration_minutes' => 90,
                'price' => 450000,
                'age_target' => 'Semua usia',
                'benefits' => 'Laporan Psikogram resmi + sesi konsultasi interpretasi hasil asesmen.',
                'show_price' => true,
                'is_active' => true,
            ],
            // 9. Psikotes Minat Bakat (Dengan Konsultasi)
            [
                'specialization_id' => $specializations['psikotes-asesmen']->id,
                'name' => 'Psikotes Minat Bakat (Dengan Konsultasi)',
                'description' => 'Asesmen pemetaan minat, bakat, dan potensi penjurusan studi/karir disertai laporan psikogram tertulis serta sesi konsultasi.',
                'duration_minutes' => 60,
                'price' => 450000,
                'age_target' => 'Anak, Remaja & Dewasa',
                'benefits' => '+ Laporan (Dengan Konsultasi). Arahan penjurusan studi dan pemetaan potensi karir.',
                'show_price' => true,
                'is_active' => true,
            ],
            // 10. Psikotes Minat Bakat (Tanpa Konsultasi)
            [
                'specialization_id' => $specializations['psikotes-asesmen']->id,
                'name' => 'Psikotes Minat Bakat (Tanpa Konsultasi)',
                'description' => 'Asesmen pemetaan minat dan bakat disertai laporan psikogram tertulis (tanpa sesi tatap muka konsultasi).',
                'duration_minutes' => 60,
                'price' => 275000,
                'age_target' => 'Anak, Remaja & Dewasa',
                'benefits' => '+ Laporan (Tanpa Konsultasi). Pemetaan potensi dan kecenderungan minat bakat tertulis.',
                'show_price' => true,
                'is_active' => true,
            ],
            // 11. Tes Kecerdasan (Dengan Konsultasi)
            [
                'specialization_id' => $specializations['psikotes-asesmen']->id,
                'name' => 'Tes Kecerdasan (Dengan Konsultasi)',
                'description' => 'Pengukuran inteligensi (skor IQ dan profil kognitif terstandar) dilengkapi laporan resmi dan konsultasi pembahasan hasil tes.',
                'duration_minutes' => 60,
                'price' => 425000,
                'age_target' => 'Semua usia',
                'benefits' => '+ Laporan (dengan konsultasi). Evaluasi skor IQ dan rekomendasi stimulasi kognitif.',
                'show_price' => true,
                'is_active' => true,
            ],
            // 12. Tes Kecerdasan (Tanpa Konsultasi)
            [
                'specialization_id' => $specializations['psikotes-asesmen']->id,
                'name' => 'Tes Kecerdasan (Tanpa Konsultasi)',
                'description' => 'Pengukuran inteligensi (skor IQ) disertai lembar laporan hasil psikogram terstandar (tanpa konsultasi).',
                'duration_minutes' => 60,
                'price' => 275000,
                'age_target' => 'Semua usia',
                'benefits' => '+ Laporan (tanpa konsultasi). Laporan resmi skor kecerdasan dan indikator kognitif.',
                'show_price' => true,
                'is_active' => true,
            ],
            // 13. Assesment Intelegensi Pasien
            [
                'specialization_id' => $specializations['psikotes-asesmen']->id,
                'name' => 'Assesment Intelegensi Pasien',
                'description' => 'Pemeriksaan profil intelegensi klinis pasien secara individual, dilengkapi laporan tertulis dan konsultasi hasil tes terpadu.',
                'duration_minutes' => 60,
                'price' => 375000,
                'age_target' => 'Pasien & Pelajar',
                'benefits' => '+ Laporan (dengan konsultasi hasil tes). Analisis daya tangkap dan kapasitas berpikir kritis.',
                'show_price' => true,
                'is_active' => true,
            ],
            // 14. Assesment Paket Kematangan Sekolah Dasar
            [
                'specialization_id' => $specializations['psikotes-asesmen']->id,
                'name' => 'Assesment Paket Kematangan Sekolah Dasar',
                'description' => 'Pemeriksaan kesiapan mental, motorik halus, dan kematangan sosial emosional anak memasuki jenjang SD + laporan & konsultasi.',
                'duration_minutes' => 60,
                'price' => 550000,
                'age_target' => 'Usia 5-7 tahun',
                'benefits' => '+ Laporan (dengan konsultasi). Rekomendasi kesiapan masuk SD dan panduan orang tua.',
                'show_price' => true,
                'is_active' => true,
            ],
            // 15. Assesment Tumbuh Kembang (Tanpa Konsultasi)
            [
                'specialization_id' => $specializations['psikotes-asesmen']->id,
                'name' => 'Assesment Tumbuh Kembang (Tanpa Konsultasi)',
                'description' => 'Pemeriksaan komprehensif tahapan milestone perkembangan anak dilengkapi laporan tertulis (tanpa konsultasi).',
                'duration_minutes' => 60,
                'price' => 350000,
                'age_target' => 'Bayi, Balita & Anak',
                'benefits' => '+ Laporan (tanpa konsultasi). Deteksi dini keterlambatan tumbuh kembang secara berkala.',
                'show_price' => true,
                'is_active' => true,
            ],
            // 16. Assesment Tumbuh Kembang (Dengan Konsultasi)
            [
                'specialization_id' => $specializations['psikotes-asesmen']->id,
                'name' => 'Assesment Tumbuh Kembang (Dengan Konsultasi)',
                'description' => 'Pemeriksaan komprehensif tahapan tumbuh kembang pasien dilengkapi laporan tertulis resmi dan sesi konsultasi dengan tim ahli.',
                'duration_minutes' => 60,
                'price' => 600000,
                'age_target' => 'Bayi, Balita & Anak',
                'benefits' => '+ Laporan (dengan konsultasi). Rencana intervensi tumbuh kembang personal & terarah.',
                'show_price' => true,
                'is_active' => true,
            ],
            // 17. Administrasi
            [
                'specialization_id' => $specializations['terapi-okupasi']->id,
                'name' => 'Administrasi',
                'description' => 'Biaya registrasi berkas pasien dan administrasi klinik per pertemuan.',
                'duration_minutes' => 15,
                'price' => 25000,
                'age_target' => 'Semua pasien',
                'benefits' => 'Per Pertemuan. Pengelolaan rekam medis dan administrasi sesi.',
                'show_price' => true,
                'is_active' => true,
            ],
            // Layanan Umum Tambahan
            [
                'specialization_id' => $specializations['fisioterapi']->id,
                'name' => 'Sesi Fisioterapi Individual',
                'description' => 'Terapi fisik satu-satu dengan fisioterapis untuk penanganan cedera dan rehabilitasi fisik fungsional.',
                'duration_minutes' => 60,
                'price' => 250000,
                'age_target' => 'Semua usia',
                'benefits' => 'Pemulihan mobilitas, pengurangan nyeri, penguatan otot.',
                'show_price' => true,
                'is_active' => true,
            ],
            [
                'specialization_id' => $specializations['akupunktur-medis']->id,
                'name' => 'Sesi Akupunktur Medis',
                'description' => 'Terapi jarum medis untuk pereda nyeri saraf, bells palsy, insomnia, dan kelancaran peredaran darah.',
                'duration_minutes' => 45,
                'price' => 220000,
                'age_target' => 'Dewasa',
                'benefits' => 'Pereda nyeri, relaksasi, perbaikan sirkulasi.',
                'show_price' => true,
                'is_active' => true,
            ],
        ];

        $services = [];
        foreach ($servicesData as $serviceItem) {
            $services[] = Service::firstOrCreate(
                ['name' => $serviceItem['name']],
                $serviceItem
            );
        }

        // 6. Contoh Booking & Review Riwayat
        $demoBooking = Booking::firstOrCreate(
            ['booking_code' => 'KT-202609-DEMO1'],
            [
                'user_id' => $parent->id,
                'patient_id' => $patient->id,
                'doctor_id' => $doctors[0]->id,
                'service_id' => $services[0]->id,
                'appointment_date' => Carbon::yesterday()->toDateString(),
                'appointment_time' => '10:00:00',
                'end_time' => '10:30:00',
                'status' => 'completed',
                'patient_complaint' => 'Nyeri punggung bawah menjalar ke paha setelah mengangkat beban.',
                'doctor_notes' => 'Pasien diberikan terapi traksi ringan dan peregangan hamstring. Evaluasi minggu depan.',
                'confirmed_at' => Carbon::yesterday()->subHours(2),
            ]
        );

        Review::firstOrCreate(
            ['booking_id' => $demoBooking->id],
            [
                'user_id' => $parent->id,
                'doctor_id' => $doctors[0]->id,
                'rating' => 5,
                'comment' => 'Pelayanan sangat ramah dan penjelasannya dokter sangat detail. Nyeri punggung terasa jauh lebih ringan.',
            ]
        );

        // 7. Sample Invoice & Payment
        $invoice = Invoice::firstOrCreate(
            ['invoice_number' => 'INV-DEMO001'],
            [
                'booking_id' => $demoBooking->id,
                'patient_id' => $patient->id,
                'guardian_id' => $guardian->id,
                'subtotal' => 250000,
                'discount_amount' => 0,
                'tax_amount' => 0,
                'total' => 250000,
                'status' => 'paid',
                'due_date' => Carbon::yesterday()->addDays(7),
                'paid_at' => Carbon::yesterday(),
            ]
        );

        Payment::firstOrCreate(
            [
                'invoice_id' => $invoice->id,
                'amount' => 250000,
            ],
            [
                'method' => 'cash',
                'status' => 'completed',
                'paid_at' => Carbon::yesterday(),
            ]
        );

        // 8. Sample Articles
        $articlesData = [
            [
                'title' => 'Pentingnya Deteksi Dini Keterlambatan Bicara pada Anak',
                'slug' => 'pentingnya-deteksi-dini-keterlambatan-bicara',
                'content' => 'Keterlambatan bicara pada anak dapat mempengaruhi perkembangan sosial dan emosional...',
                'excerpt' => 'Kenali tanda-tanda keterlambatan bicara dan kapan saatnya berkonsultasi dengan terapis wicara.',
                'category' => 'Edukasi Orang Tua',
                'tags' => 'terapi wicara,anak,perkembangan',
                'is_published' => true,
                'published_at' => Carbon::now()->subDays(10),
                'author_id' => $admin->id,
            ],
            [
                'title' => 'Tips Merawat Punggung untuk Orang yang Bekerja di Kantor',
                'slug' => 'tips-merawat-punggung-pekerja-kantor',
                'content' => 'Duduk terlalu lama dapat menyebabkan nyeri punggung dan postur yang buruk...',
                'excerpt' => 'Pelajari cara menjaga kesehatan punggung meskipun bekerja di depan komputer sepanjang hari.',
                'category' => 'Kesehatan',
                'tags' => 'fisioterapi,nyeri punggang,postur',
                'is_published' => true,
                'published_at' => Carbon::now()->subDays(5),
                'author_id' => $admin->id,
            ],
        ];

        foreach ($articlesData as $articleItem) {
            Article::firstOrCreate(
                ['slug' => $articleItem['slug']],
                $articleItem
            );
        }
    }
}
