<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Question extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'question',
        'explanation',
        'category',
        'age_group',
        'difficulty',
        'options',
        'is_active',
        'order',
        'view_count',
        'attempt_count',
        'correct_count',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'options' => 'array',
        'is_active' => 'boolean',
        'view_count' => 'integer',
        'attempt_count' => 'integer',
        'correct_count' => 'integer'
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'created_by');
    }

public function tags(): BelongsToMany
{
    return $this->belongsToMany(Tag::class);
}

    public function updater(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'updated_by');
    }

    public function getCorrectOptionAttribute()
    {
        foreach ($this->options as $option) {
            if ($option['is_correct']) {
                return $option;
            }
        }
        return null;
    }

    public function getCorrectAnswerAttribute()
    {
        $correct = $this->correct_option;
        return $correct ? $correct['id'] : null;
    }

    public function getOptionText($optionId)
    {
        foreach ($this->options as $option) {
            if ($option['id'] === $optionId) {
                return $option['text'];
            }
        }
        return null;
    }

    public function incrementViewCount()
    {
        $this->increment('view_count');
    }

    public function incrementAttemptCount($isCorrect = false)
    {
        $this->increment('attempt_count');
        if ($isCorrect) {
            $this->increment('correct_count');
        }
    }

    public function getSuccessRateAttribute()
    {
        if ($this->attempt_count === 0) {
            return 0;
        }
        return round(($this->correct_count / $this->attempt_count) * 100, 2);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByAgeGroup($query, $ageGroup)
    {
        return $query->where('age_group', $ageGroup);
    }

    public function scopeByDifficulty($query, $difficulty)
    {
        return $query->where('difficulty', $difficulty);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where('question', 'like', "%{$search}%");
    }
}