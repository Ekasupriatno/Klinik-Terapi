<?php

use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Middleware\IsAdmin;
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
    Route::post('/login', [AuthController::class, 'login']);
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

// ==========================================
// 2. PROTECTED ROUTES (Wajib Login Pasien/Admin)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
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

    // ==========================================
    // 3. ADMIN ONLY ROUTES (Khusus Admin)
    // ==========================================
    Route::middleware(IsAdmin::class)->prefix('admin')->group(function () {
        // Statistik Dashboard
        Route::get('/stats', [DashboardController::class, 'stats']);

        // Manajemen Dokter
        Route::post('/doctors', [DoctorController::class, 'store']);
        Route::put('/doctors/{doctor}', [DoctorController::class, 'update']);
        Route::delete('/doctors/{doctor}', [DoctorController::class, 'destroy']);

        // Manajemen Jadwal Dokter
        Route::post('/schedules', [ScheduleController::class, 'store']);
        Route::put('/schedules/{schedule}', [ScheduleController::class, 'update']);
        Route::delete('/schedules/{schedule}', [ScheduleController::class, 'destroy']);

        // Manajemen Status Booking
        Route::put('/bookings/{booking}/status', [BookingController::class, 'updateStatus']);
    });
});
