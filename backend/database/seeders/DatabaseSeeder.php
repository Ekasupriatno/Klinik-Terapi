<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Booking;
use App\Models\Child;
use App\Models\Doctor;
use App\Models\Guardian;
use App\Models\Invoice;
use App\Models\Payment;
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
                'relationship_to_child' => 'parent',
            ]
        );

        $guardianPasien = Guardian::firstOrCreate(
            ['user_id' => $pasien->id],
            [
                'phone' => '081234567899',
                'address' => 'Jl. Mawar No. 45, Jakarta Selatan',
                'emergency_contact' => 'Dewi Lestari',
                'emergency_phone' => '081298765432',
                'relationship_to_child' => 'parent',
            ]
        );

        // Create child/patient
        $child = Child::firstOrCreate(
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

        Child::firstOrCreate(
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
                'sip_number' => 'SIP/446/2021/001',
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
                'sip_number' => 'SIP/446/2022/089',
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
                'sip_number' => 'SIP/446/2020/045',
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
                'sip_number' => 'SIP/446/2019/112',
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
                'sip_number' => 'SIP/446/2021/156',
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
            $doc = Doctor::firstOrCreate(['sip_number' => $docItem['sip_number']], $docItem);
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

        // 5. Services
        $servicesData = [
            [
                'specialization_id' => $specializations['fisioterapi']->id,
                'name' => 'Sesi Fisioterapi Individual',
                'description' => 'Terapi fisik satu-satu dengan fisioterapis untuk penanganan cedera dan rehabilitasi.',
                'duration_minutes' => 60,
                'price' => 250000,
                'age_target' => 'Semua usia',
                'benefits' => 'Pemulihan mobilitas, pengurangan nyeri, penguatan otot',
                'show_price' => true,
                'is_active' => true,
            ],
            [
                'specialization_id' => $specializations['terapi-wicara']->id,
                'name' => 'Evaluasi Terapi Wicara',
                'description' => 'Asesmen awal kemampuan bicara dan bahasa anak.',
                'duration_minutes' => 45,
                'price' => 180000,
                'age_target' => '2-12 tahun',
                'benefits' => 'Identifikasi keterlambatan bicara, rencana intervensi',
                'show_price' => true,
                'is_active' => true,
            ],
            [
                'specialization_id' => $specializations['akupunktur-medis']->id,
                'name' => 'Sesi Akupunktur Medis',
                'description' => 'Terapi jarum medis untuk pereda nyeri dan peredaran darah.',
                'duration_minutes' => 45,
                'price' => 220000,
                'age_target' => 'Dewasa',
                'benefits' => 'Pereda nyeri, relaksasi, perbaikan sirkulasi',
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
                'child_id' => $child->id,
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
                'child_id' => $child->id,
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
