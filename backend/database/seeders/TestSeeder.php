<?php

namespace Database\Seeders;

use App\Models\Test;
use App\Models\Question;
use App\Models\Admin;
use Illuminate\Database\Seeder;

class TestSeeder extends Seeder
{
    public function run(): void
    {
        $admin = Admin::first();
        
        $tests = [
            [
                'test_id' => 'TEST001',
                'title' => 'Spoken English Basics Quiz',
                'slug' => 'spoken-english-basics-quiz',
                'description' => 'Test your basic English speaking skills',
                'type' => 'quiz',
                'category' => 'spoken-english',
                'age_group' => '6-8',
                'duration' => 30,
                'total_questions' => 20,
                'passing_score' => 60,
                'max_attempts' => 3,
                'price' => 0,
                'is_free' => true,
                'is_active' => true,
                'status' => 'published',
                'total_attempts' => 125,
                'average_score' => 72.5,
                'completion_rate' => 88.2,
                'created_at' => now()->subDays(30)
            ],
            [
                'test_id' => 'TEST002',
                'title' => 'Physics Fundamentals Exam',
                'slug' => 'physics-fundamentals-exam',
                'description' => 'Comprehensive physics exam for beginners',
                'type' => 'exam',
                'category' => 'physics',
                'age_group' => '12-14',
                'duration' => 60,
                'total_questions' => 40,
                'passing_score' => 70,
                'max_attempts' => 2,
                'price' => 19.99,
                'is_free' => false,
                'is_active' => true,
                'status' => 'published',
                'total_attempts' => 89,
                'average_score' => 65.3,
                'completion_rate' => 76.4,
                'created_at' => now()->subDays(25)
            ],
            [
                'test_id' => 'TEST003',
                'title' => 'Math Skills Assessment',
                'slug' => 'math-skills-assessment',
                'description' => 'Assess your mathematics skills',
                'type' => 'assessment',
                'category' => 'general-maths',
                'age_group' => '9-11',
                'duration' => 45,
                'total_questions' => 30,
                'passing_score' => 65,
                'max_attempts' => 5,
                'price' => 0,
                'is_free' => true,
                'is_active' => true,
                'status' => 'published',
                'total_attempts' => 210,
                'average_score' => 78.9,
                'completion_rate' => 92.1,
                'created_at' => now()->subDays(20)
            ],
            [
                'test_id' => 'TEST004',
                'title' => 'Computer Basics Practice',
                'slug' => 'computer-basics-practice',
                'description' => 'Practice test for computer fundamentals',
                'type' => 'practice',
                'category' => 'basic-computer',
                'age_group' => '9-11',
                'duration' => 25,
                'total_questions' => 15,
                'passing_score' => 50,
                'max_attempts' => 10,
                'price' => 0,
                'is_free' => true,
                'is_active' => true,
                'status' => 'published',
                'total_attempts' => 156,
                'average_score' => 82.3,
                'completion_rate' => 94.5,
                'created_at' => now()->subDays(15)
            ],
            [
                'test_id' => 'TEST005',
                'title' => 'General Knowledge Challenge',
                'slug' => 'general-knowledge-challenge',
                'description' => 'Test your general knowledge',
                'type' => 'quiz',
                'category' => 'general-knowledge',
                'age_group' => '6-8',
                'duration' => 20,
                'total_questions' => 10,
                'passing_score' => 60,
                'max_attempts' => 3,
                'price' => 9.99,
                'is_free' => false,
                'is_active' => true,
                'status' => 'published',
                'total_attempts' => 73,
                'average_score' => 68.7,
                'completion_rate' => 81.2,
                'created_at' => now()->subDays(10)
            ]
        ];

        foreach ($tests as $testData) {
            $test = Test::create($testData);
            
            // Add questions to test based on category and age group
            $questions = Question::where('category', $test->category)
                ->where('age_group', $test->age_group)
                ->inRandomOrder()
                ->limit($test->total_questions)
                ->get();
            
            $order = 1;
            foreach ($questions as $question) {
                $test->questions()->attach($question->id, [
                    'order' => $order,
                    'marks' => 1
                ]);
                $order++;
            }
        }
        
        $this->command->info('✅ 5 tests seeded with questions successfully!');
    }
}