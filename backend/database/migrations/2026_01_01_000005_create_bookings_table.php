<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_code', 32)->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('doctor_id')->constrained('doctors')->cascadeOnDelete();
            $table->foreignId('schedule_id')->nullable()->constrained('schedules')->nullOnDelete();
            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->time('end_time');
            $table->enum('status', [
                'pending',
                'confirmed',
                'in_consultation',
                'completed',
                'cancelled',
                'no_show'
            ])->default('pending');
            $table->text('patient_complaint');
            $table->text('doctor_notes')->nullable();
            $table->string('cancel_reason')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indeks untuk pencarian slot cepat dan validasi konkurensi
            $table->index(['doctor_id', 'appointment_date', 'appointment_time']);
            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
