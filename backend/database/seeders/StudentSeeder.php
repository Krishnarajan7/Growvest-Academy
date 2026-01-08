<?php

namespace Database\Seeders;

use App\Models\Student;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        // Create 50 students
        Student::factory()->count(50)->create();

        // Create specific test students
        Student::factory()->create([
            'first_name' => 'Test',
            'last_name' => 'Student',
            'email' => 'student@example.com',
            'password' => Hash::make('student123'),
            'status' => 'active',
            'account_type' => 'premium',
        ]);
    }
}