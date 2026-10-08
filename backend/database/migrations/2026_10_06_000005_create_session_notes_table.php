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
        Schema::create('session_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->foreignId('therapist_id')->constrained('doctors')->cascadeOnDelete();
            $table->text('note');
            $table->text('interventions')->nullable();
            $table->text('observations')->nullable();
            $table->text('progress')->nullable();
            $table->text('next_plan')->nullable();
            $table->enum('status', ['draft', 'completed'])->default('draft');
            $table->boolean('share_with_guardian')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['booking_id', 'therapist_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('session_notes');
    }
};
