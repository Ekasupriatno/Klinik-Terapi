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
        // 1. Update users role to include 'doctor'
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'admin', 'receptionist', 'therapist', 'parent', 'patient', 'doctor') NOT NULL DEFAULT 'parent'");
        }

        // 2. Update doctors table columns
        Schema::table('doctors', function (Blueprint $table) {
            // Make specialization_id nullable to allow registering with string specialization
            if (Schema::hasColumn('doctors', 'specialization_id')) {
                $table->foreignId('specialization_id')->nullable()->change();
            }

            // Make sip_number nullable so registration using license_number works seamlessly
            if (Schema::hasColumn('doctors', 'sip_number')) {
                $table->string('sip_number')->nullable()->change();
            }

            // Add new required & profile fields for doctor registration
            if (!Schema::hasColumn('doctors', 'specialization')) {
                $table->string('specialization')->nullable()->after('specialization_id');
            }

            if (!Schema::hasColumn('doctors', 'license_number')) {
                $table->string('license_number')->nullable()->unique()->after('specialization');
            }

            if (!Schema::hasColumn('doctors', 'phone')) {
                $table->string('phone')->nullable()->after('license_number');
            }

            if (!Schema::hasColumn('doctors', 'gender')) {
                $table->string('gender', 20)->nullable()->after('phone');
            }

            if (!Schema::hasColumn('doctors', 'birth_date')) {
                $table->date('birth_date')->nullable()->after('gender');
            }

            if (!Schema::hasColumn('doctors', 'address')) {
                $table->text('address')->nullable()->after('birth_date');
            }

            if (!Schema::hasColumn('doctors', 'education')) {
                $table->string('education')->nullable()->after('address');
            }

            if (!Schema::hasColumn('doctors', 'profile_photo')) {
                $table->string('profile_photo')->nullable()->after('bio');
            }

            if (!Schema::hasColumn('doctors', 'status')) {
                $table->enum('status', ['pending', 'approved', 'rejected', 'suspended'])
                    ->default('pending')
                    ->after('profile_photo');
            }

            if (!Schema::hasColumn('doctors', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('status');
            }
        });

        // Set existing active doctors to 'approved'
        if (Schema::hasColumn('doctors', 'status')) {
            DB::table('doctors')->where('is_active', true)->where('status', 'pending')->update(['status' => 'approved']);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('doctors', function (Blueprint $table) {
            $columnsToDrop = [
                'specialization',
                'license_number',
                'phone',
                'gender',
                'birth_date',
                'address',
                'education',
                'profile_photo',
                'status',
                'rejection_reason',
            ];

            foreach ($columnsToDrop as $col) {
                if (Schema::hasColumn('doctors', $col)) {
                    $table->dropColumn($col);
                }
            }
        });

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'admin', 'receptionist', 'therapist', 'parent', 'patient') NOT NULL DEFAULT 'parent'");
        }
    }
};
