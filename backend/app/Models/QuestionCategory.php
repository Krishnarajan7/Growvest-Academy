<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuestionCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'color',
        'icon',
        'description',
        'order',
        'question_count',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'question_count' => 'integer'
    ];

    public function getColorClassAttribute()
    {
        $colorMap = [
            '#3b82f6' => 'bg-blue-500',
            '#8b5cf6' => 'bg-purple-500',
            '#10b981' => 'bg-green-500',
            '#f59e0b' => 'bg-orange-500',
            '#ec4899' => 'bg-pink-500',
            '#06b6d4' => 'bg-cyan-500',
            '#ef4444' => 'bg-red-500',
            '#6b7280' => 'bg-gray-500',
        ];

        return $colorMap[$this->color] ?? 'bg-gray-500';
    }

    public function updateQuestionCount()
    {
        $this->update([
            'question_count' => Question::where('category', $this->slug)->count()
        ]);
    }
}