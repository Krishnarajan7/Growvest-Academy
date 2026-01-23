<?php

namespace Database\Seeders;

use App\Models\QuestionCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class QuestionCategorySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('question_categories')->truncate();
        $categories = [
            [
                'name' => 'Spoken English',
                'slug' => 'spoken-english',
                'color' => '#3b82f6', // blue-500
                'icon' => 'fa-comments',
                'description' => 'English speaking and conversation skills',
                'order' => 1,
                'is_active' => true
            ],
            [
                'name' => 'Phonics Song',
                'slug' => 'phonics-song',
                'color' => '#8b5cf6', // purple-500
                'icon' => 'fa-atom',
                'description' => 'Basic phonics and songs',
                'order' => 2,
                'is_active' => true
            ],
            [
                'name' => 'General Maths',
                'slug' => 'general-maths',
                'color' => '#10b981', // green-500
                'icon' => 'fa-calculator',
                'description' => 'Mathematics and arithmetic skills',
                'order' => 3,
                'is_active' => true
            ],
            [
                'name' => 'Basic Computer',
                'slug' => 'basic-computer',
                'color' => '#f59e0b', // orange-500
                'icon' => 'fa-laptop',
                'description' => 'Computer fundamentals and technology',
                'order' => 4,
                'is_active' => true
            ],
            [
                'name' => 'General Knowledge',
                'slug' => 'general-knowledge',
                'color' => '#ec4899', // pink-500
                'icon' => 'fa-brain',
                'description' => 'General knowledge and current affairs',
                'order' => 5,
                'is_active' => true
            ],
            [
                'name' => 'Public Speaking',
                'slug' => 'public-speaking',
                'color' => '#06b6d4', // cyan-500
                'icon' => 'fa-microphone',
                'description' => 'Public speaking and presentation skills',
                'order' => 6,
                'is_active' => true
            ]
        ];

        foreach ($categories as $category) {
            QuestionCategory::create($category);
        }
    }
}