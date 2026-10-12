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
        Schema::table('bookings', function (Blueprint $table) {
            $table->foreignId('patient_id')->nullable()->after('user_id')->constrained('patients')->nullOnDelete();
            $table->foreignId('service_id')->nullable()->after('doctor_id')->constrained('services')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['patient_id']);
            $table->dropForeign(['service_id']);
            $table->dropColumn(['patient_id', 'service_id']);
        });
    }
};
