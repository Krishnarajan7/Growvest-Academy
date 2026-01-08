<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TestAttempt extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'attempt_id',
        'test_id',
        'student_id',
        'attempt_number',
        'started_at',
        'completed_at',
        'time_spent',
        'total_questions',
        'questions_attempted',
        'correct_answers',
        'score',
        'percentage',
        'status',
        'answers',
        'result_details'
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'score' => 'decimal:2',
        'percentage' => 'decimal:2',
        'answers' => 'array',
        'result_details' => 'array'
    ];

    public function test(): BelongsTo
    {
        return $this->belongsTo(Test::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(TestAnswer::class, 'attempt_id');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeByStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function getIsPassedAttribute()
    {
        return $this->percentage >= $this->test->passing_score;
    }
}