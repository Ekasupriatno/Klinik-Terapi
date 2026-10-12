<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patient extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'patients';

    protected $fillable = [
        'guardian_id',
        'name',
        'birth_date',
        'gender',
        'status',
        'medical_history',
        'allergies',
        'notes',
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    public function guardian(): BelongsTo
    {
        return $this->belongsTo(Guardian::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'patient_id');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'patient_id');
    }

    public function getAgeAttribute(): int
    {
        return $this->birth_date ? $this->birth_date->diffInYears(now()) : 0;
    }
}
