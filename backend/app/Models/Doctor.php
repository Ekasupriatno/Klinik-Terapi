<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Doctor extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'specialization_id',
        'specialization',
        'name',
        'license_number',
        'sip_number',
        'title',
        'phone',
        'gender',
        'birth_date',
        'address',
        'education',
        'experience_years',
        'consultation_fee',
        'bio',
        'profile_photo',
        'image_url',
        'image_thumbnail_url',
        'image_medium_url',
        'status',
        'rejection_reason',
        'is_active',
    ];

    protected $casts = [
        'consultation_fee' => 'decimal:2',
        'is_active' => 'boolean',
        'experience_years' => 'integer',
        'birth_date' => 'date',
    ];

    protected $appends = ['average_rating', 'total_reviews', 'profile_photo_url'];

    public function specialization(): BelongsTo
    {
        return $this->belongsTo(Specialization::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function getAverageRatingAttribute(): float
    {
        return (float) round($this->reviews()->avg('rating') ?? 5.0, 1);
    }

    public function getTotalReviewsAttribute(): int
    {
        return (int) $this->reviews()->count();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->where('status', 'approved');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    public function getProfilePhotoUrlAttribute(): ?string
    {
        if ($this->profile_photo) {
            return asset('storage/' . $this->profile_photo);
        }
        return $this->image_url;
    }
}
