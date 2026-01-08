<?php

namespace Database\Seeders;

use App\Models\Question;
use App\Models\Admin;
use Illuminate\Database\Seeder;

class QuestionSeeder extends Seeder
{
    public function run(): void
    {
        $admin = Admin::first();

        $questions = [
            [
                'question' => 'What is the correct way to greet someone in the morning?',
                'explanation' => 'Good morning is the appropriate greeting used in the morning hours until noon.',
                'category' => 'spoken-english',
                'age_group' => '6-8',
                'difficulty' => 'easy',
                'options' => [
                    ['id' => 'a', 'text' => 'Good morning!', 'is_correct' => true],
                    ['id' => 'b', 'text' => 'Good night!', 'is_correct' => false],
                    ['id' => 'c', 'text' => 'Good bye!', 'is_correct' => false],
                    ['id' => 'd', 'text' => 'See you later!', 'is_correct' => false]
                ],
                'is_active' => true,
                'created_by' => $admin->id,
                'updated_by' => $admin->id
            ],
            [
                'question' => 'What is the unit of force?',
                'explanation' => 'The SI unit of force is Newton (N), named after Sir Isaac Newton.',
                'category' => 'physics',
                'age_group' => '12-14',
                'difficulty' => 'medium',
                'options' => [
                    ['id' => 'a', 'text' => 'Meter', 'is_correct' => false],
                    ['id' => 'b', 'text' => 'Newton', 'is_correct' => true],
                    ['id' => 'c', 'text' => 'Kilogram', 'is_correct' => false],
                    ['id' => 'd', 'text' => 'Joule', 'is_correct' => false]
                ],
                'is_active' => true,
                'created_by' => $admin->id,
                'updated_by' => $admin->id
            ],
            [
                'question' => 'What is 15 + 27?',
                'explanation' => '15 + 27 = 42. Add the ones place first (5+7=12, carry 1), then tens (1+2+1=4).',
                'category' => 'general-maths',
                'age_group' => '6-8',
                'difficulty' => 'easy',
                'options' => [
                    ['id' => 'a', 'text' => '40', 'is_correct' => false],
                    ['id' => 'b', 'text' => '42', 'is_correct' => true],
                    ['id' => 'c', 'text' => '43', 'is_correct' => false],
                    ['id' => 'd', 'text' => '41', 'is_correct' => false]
                ],
                'is_active' => true,
                'created_by' => $admin->id,
                'updated_by' => $admin->id
            ],
            [
                'question' => 'What is the brain of a computer called?',
                'explanation' => 'CPU (Central Processing Unit) is called the brain of the computer as it processes all instructions.',
                'category' => 'basic-computer',
                'age_group' => '9-11',
                'difficulty' => 'easy',
                'options' => [
                    ['id' => 'a', 'text' => 'Monitor', 'is_correct' => false],
                    ['id' => 'b', 'text' => 'Keyboard', 'is_correct' => false],
                    ['id' => 'c', 'text' => 'CPU', 'is_correct' => true],
                    ['id' => 'd', 'text' => 'Mouse', 'is_correct' => false]
                ],
                'is_active' => true,
                'created_by' => $admin->id,
                'updated_by' => $admin->id
            ],
            [
                'question' => 'What is the capital of India?',
                'explanation' => 'New Delhi is the capital city of India and the seat of the Indian government.',
                'category' => 'general-knowledge',
                'age_group' => '6-8',
                'difficulty' => 'easy',
                'options' => [
                    ['id' => 'a', 'text' => 'Mumbai', 'is_correct' => false],
                    ['id' => 'b', 'text' => 'New Delhi', 'is_correct' => true],
                    ['id' => 'c', 'text' => 'Kolkata', 'is_correct' => false],
                    ['id' => 'd', 'text' => 'Chennai', 'is_correct' => false]
                ],
                'is_active' => true,
                'created_by' => $admin->id,
                'updated_by' => $admin->id
            ]
        ];

        foreach ($questions as $questionData) {
            Question::create($questionData);
        }
    }
}