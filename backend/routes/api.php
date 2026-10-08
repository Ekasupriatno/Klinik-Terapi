<?php

use App\Http\Controllers\Api\Admin\DoctorController as AdminDoctorController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\AccountController;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\ChildController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\GuardianController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\SessionNoteController;
use App\Http\Controllers\Api\TherapistController;
use App\Http\Controllers\Api\ClinicSettingController;
use App\Http\Middleware\IsAdmin;
use App\Http\Middleware\IsDoctor;
use App\Http\Middleware\IsPatient;
use App\Models\Specialization;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Klinik Terapi
|--------------------------------------------------------------------------
*/

// ==========================================
// 1. PUBLIC ROUTES (Tanpa Autentikasi)
// ==========================================
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/register/doctor', [AuthController::class, 'registerDoctor'])->middleware('throttle:login');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// Info Spesialisasi
Route::get('/specializations', function () {
    return response()->json([
        'success' => true,
        'data' => Specialization::all(),
    ]);
});

// Dokter & Slot Jadwal
Route::get('/doctors', [DoctorController::class, 'index']);
Route::get('/doctors/{doctor}', [DoctorController::class, 'show']);
Route::get('/doctors/{doctor}/available-slots', [DoctorController::class, 'availableSlots']);
Route::get('/schedules/doctor/{id}', [ScheduleController::class, 'byDoctor']);

// Layanan (Services)
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{service}', [ServiceController::class, 'show']);

// Artikel (Public)
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{article}', [ArticleController::class, 'show']);

// Pengaturan Informasi Klinik (Public)
Route::get('/settings', [ClinicSettingController::class, 'show']);

// ==========================================
// 2. PROTECTED ROUTES (Wajib Login Pasien/Admin)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{notificationId}/read', [NotificationController::class, 'markAsRead']);

    // Auth & Profil
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    // Booking Pasien
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/{booking}', [BookingController::class, 'show']);
    Route::put('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);

    // Ulasan / Rating Dokter
    Route::post('/reviews', [ReviewController::class, 'store']);

    // Guardian routes (for logged-in parents)
    Route::get('/guardian/me', [GuardianController::class, 'me']);
    Route::put('/guardian/me', [GuardianController::class, 'updateMe']);

    // Children routes (for logged-in parents)
    Route::get('/children', [ChildController::class, 'index']);
    Route::post('/children', [ChildController::class, 'store']);
    Route::get('/children/{child}', [ChildController::class, 'show']);
    Route::put('/children/{child}', [ChildController::class, 'update']);

    // Invoices (for logged-in parents)
    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::get('/invoices/{invoice}', [InvoiceController::class, 'show']);

    // Therapist routes
    Route::prefix('therapist')->middleware('is.therapist')->group(function () {
        Route::get('/dashboard', [TherapistController::class, 'dashboard']);
        Route::get('/patients', [TherapistController::class, 'patients']);
        Route::get('/session-notes', [TherapistController::class, 'sessionNotes']);
        Route::post('/session-notes', [SessionNoteController::class, 'store']);
        Route::put('/session-notes/{sessionNote}', [SessionNoteController::class, 'update']);
        Route::get('/calendar', [TherapistController::class, 'calendar']);
    });

    // Doctor specific routes (Only approved doctors)
    Route::prefix('doctor')->middleware('is.doctor')->group(function () {
        Route::get('/dashboard', [TherapistController::class, 'dashboard']);
        Route::get('/patients', [TherapistController::class, 'patients']);
        Route::get('/session-notes', [TherapistController::class, 'sessionNotes']);
        Route::get('/calendar', [TherapistController::class, 'calendar']);
        Route::get('/profile', function (\Illuminate\Http\Request $request) {
            return response()->json([
                'success' => true,
                'data' => new \App\Http\Resources\DoctorResource($request->user()->doctor->loadMissing(['specialization', 'user'])),
            ]);
        });
    });

    // Patient specific routes
    Route::prefix('patient')->middleware('is.patient')->group(function () {
        Route::get('/profile', function (\Illuminate\Http\Request $request) {
            return response()->json([
                'success' => true,
                'data' => new \App\Http\Resources\UserResource($request->user()),
            ]);
        });
    });

    // ==========================================
    // 3. ADMIN ONLY ROUTES (Khusus Admin)
    // ==========================================
    Route::middleware(IsAdmin::class)->prefix('admin')->group(function () {
        Route::post('/accounts/admin', [AccountController::class, 'store']);
        Route::put('/account/password', [AccountController::class, 'changePassword']);
        // Statistik Dashboard
        Route::get('/stats', [DashboardController::class, 'stats']);

        // Verifikasi & Approval Pendaftaran Dokter (Admin)
        Route::get('/doctors/pending', [AdminDoctorController::class, 'pending']);
        Route::get('/doctors/{id}', [AdminDoctorController::class, 'show'])->whereNumber('id');
        Route::put('/doctors/{id}/approve', [AdminDoctorController::class, 'approve'])->whereNumber('id');
        Route::put('/doctors/{id}/reject', [AdminDoctorController::class, 'reject'])->whereNumber('id');
        Route::put('/doctors/{id}/suspend', [AdminDoctorController::class, 'suspend'])->whereNumber('id');

        // Data Pasien untuk Operasional Admin
        Route::get('/patients', [BookingController::class, 'patients']);

        // Manajemen Dokter
        Route::get('/therapist-accounts', [DoctorController::class, 'therapistAccounts']);
        Route::get('/doctors', [DoctorController::class, 'adminIndex']);
        Route::post('/doctors', [DoctorController::class, 'store']);
        Route::put('/doctors/{doctor}', [DoctorController::class, 'update']);
        Route::delete('/doctors/{doctor}', [DoctorController::class, 'destroy']);

        // Manajemen Jadwal Dokter
        Route::post('/schedules', [ScheduleController::class, 'store']);
        Route::put('/schedules/{schedule}', [ScheduleController::class, 'update']);
        Route::delete('/schedules/{schedule}', [ScheduleController::class, 'destroy']);

        // Manajemen Reservasi Pasien (CRUD)
        Route::post('/bookings', [BookingController::class, 'adminStore']);
        Route::put('/bookings/{booking}', [BookingController::class, 'adminUpdate']);
        Route::put('/bookings/{booking}/status', [BookingController::class, 'updateStatus']);
        Route::delete('/bookings/{booking}', [BookingController::class, 'destroy']);

        // Manajemen Guardian
        Route::get('/guardians', [GuardianController::class, 'index']);
        Route::get('/guardians/{guardian}', [GuardianController::class, 'show']);
        Route::post('/guardians', [GuardianController::class, 'store']);
        Route::put('/guardians/{guardian}', [GuardianController::class, 'update']);
        Route::delete('/guardians/{guardian}', [GuardianController::class, 'destroy']);

        // Manajemen Children/Patients
        Route::get('/children', [ChildController::class, 'index']);
        Route::get('/children/{child}', [ChildController::class, 'show']);
        Route::post('/children', [ChildController::class, 'store']);
        Route::put('/children/{child}', [ChildController::class, 'update']);
        Route::delete('/children/{child}', [ChildController::class, 'destroy']);

        // Manajemen Services
        Route::get('/services', [ServiceController::class, 'index']);
        Route::get('/services/{service}', [ServiceController::class, 'show']);
        Route::post('/services', [ServiceController::class, 'store']);
        Route::put('/services/{service}', [ServiceController::class, 'update']);
        Route::delete('/services/{service}', [ServiceController::class, 'destroy']);

        // Manajemen Session Notes
        Route::get('/session-notes', [SessionNoteController::class, 'index']);
        Route::get('/session-notes/{sessionNote}', [SessionNoteController::class, 'show']);
        Route::post('/session-notes', [SessionNoteController::class, 'store']);
        Route::put('/session-notes/{sessionNote}', [SessionNoteController::class, 'update']);
        Route::delete('/session-notes/{sessionNote}', [SessionNoteController::class, 'destroy']);

        // Manajemen Invoices
        Route::get('/invoices', [InvoiceController::class, 'index']);
        Route::get('/invoices/{invoice}', [InvoiceController::class, 'show']);
        Route::post('/invoices', [InvoiceController::class, 'store']);
        Route::put('/invoices/{invoice}', [InvoiceController::class, 'update']);
        Route::delete('/invoices/{invoice}', [InvoiceController::class, 'destroy']);

        // Manajemen Payments
        Route::get('/payments', [PaymentController::class, 'index']);
        Route::get('/payments/{payment}', [PaymentController::class, 'show']);
        Route::post('/payments', [PaymentController::class, 'store']);
        Route::put('/payments/{payment}', [PaymentController::class, 'update']);
        Route::delete('/payments/{payment}', [PaymentController::class, 'destroy']);

        // Manajemen Articles (CMS)
        Route::get('/articles', [ArticleController::class, 'index']);
        Route::get('/articles/{article}', [ArticleController::class, 'show']);
        Route::post('/articles', [ArticleController::class, 'store']);
        Route::put('/articles/{article}', [ArticleController::class, 'update']);
        Route::delete('/articles/{article}', [ArticleController::class, 'destroy']);

        // Audit Logs
        Route::get('/audit-logs', [AuditLogController::class, 'index']);
        Route::get('/audit-logs/{auditLog}', [AuditLogController::class, 'show']);
        Route::delete('/audit-logs/{auditLog}', [AuditLogController::class, 'destroy']);

        // Pengaturan Informasi Kontak Klinik
        Route::get('/settings', [ClinicSettingController::class, 'show']);
        Route::put('/settings', [ClinicSettingController::class, 'update']);
    });
});
