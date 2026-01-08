<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Test extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'test_id',
        'title',
        'slug',
        'description',
        'type',
        'category',
        'age_group',
        'duration',
        'total_questions',
        'passing_score',
        'max_attempts',
        'price',
        'is_free',
        'is_active',
        'start_date',
        'end_date',
        'settings',
        'total_attempts',
        'average_score',
        'completion_rate'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_free' => 'boolean',
        'is_active' => 'boolean',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'settings' => 'array',
        'average_score' => 'decimal:2',
        'completion_rate' => 'decimal:2'
    ];

    public function questions(): BelongsToMany
    {
        return $this->belongsToMany(Question::class, 'test_questions')
            ->withPivot('order', 'marks')
            ->orderByPivot('order');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(TestAttempt::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeAvailable($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('start_date')
              ->orWhere('start_date', '<=', now());
        })->where(function ($q) {
            $q->whereNull('end_date')
              ->orWhere('end_date', '>=', now());
        });
    }

    public function getIsAvailableAttribute()
    {
        $now = now();
        return (!$this->start_date || $this->start_date <= $now) &&
               (!$this->end_date || $this->end_date >= $now);
    }
}