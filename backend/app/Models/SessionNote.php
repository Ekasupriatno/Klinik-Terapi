<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SessionNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'therapist_id',
        'note',
        'interventions',
        'observations',
        'progress',
        'next_plan',
        'status',
        'share_with_guardian',
        'completed_at',
    ];

    protected $casts = [
        'share_with_guardian' => 'boolean',
        'completed_at' => 'datetime',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function therapist(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'therapist_id');
    }
}
