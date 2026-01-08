<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgeGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'min_age',
        'max_age',
        'description',
        'order',
        'question_count',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'question_count' => 'integer'
    ];

    public function updateQuestionCount()
    {
        $this->update([
            'question_count' => Question::where('age_group', $this->slug)->count()
        ]);
    }
}