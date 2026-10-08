<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'specialization_id',
        'name',
        'description',
        'duration_minutes',
        'price',
        'age_target',
        'benefits',
        'show_price',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'show_price' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function specialization(): BelongsTo
    {
        return $this->belongsTo(Specialization::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
