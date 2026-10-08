<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('clinic_settings', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('Klinik Terapi & Rehabilitasi Medik');
            $table->string('phone')->default('+62 82235123063');
            $table->string('whatsapp')->default('6282235123063');
            $table->string('email')->default('layanan@klinikterapi.com');
            $table->text('address');
            $table->text('operational_hours')->nullable();
            $table->timestamps();
        });

        // Insert initial default settings row
        DB::table('clinic_settings')->insert([
            'name' => 'Klinik Terapi & Rehabilitasi Medik',
            'phone' => '+62 82235123063',
            'whatsapp' => '6282235123063',
            'email' => 'layanan@klinikterapi.com',
            'address' => 'Jl. HMS Mintareja Sarjana Hukum No.Ruko A-28, Baros, Kec. Cimahi Tengah, Kota Cimahi, Jawa Barat 40521',
            'operational_hours' => "Senin - Jumat: 08:00 - 18:00 WIB\nSabtu: 08:00 - 15:00 WIB\nMinggu & Libur Nasional: Tutup",
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clinic_settings');
    }
};
