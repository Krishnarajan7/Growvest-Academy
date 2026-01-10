<?php

namespace Database\Seeders;

use App\Models\Student;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $ageGroups = ['6-8', '9-11', '12-14', '15-16'];
        $firstNames = ['John', 'Emma', 'Michael', 'Sophia', 'William', 'Olivia', 'James', 'Ava', 'Robert', 'Isabella'];
        $lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
        
        // Create 30 dummy students
        for ($i = 1; $i <= 30; $i++) {
            $firstName = $firstNames[array_rand($firstNames)];
            $lastName = $lastNames[array_rand($lastNames)];
            $ageGroup = $ageGroups[array_rand($ageGroups)];
            $username = strtolower($firstName . $lastName . $i);
            
            Student::create([
                'student_id' => 'STU' . str_pad($i, 6, '0', STR_PAD_LEFT),
                'student_code' => 'SK' . date('Ymd') . str_pad($i, 4, '0', STR_PAD_LEFT),
                'first_name' => $firstName,
                'last_name' => $lastName,
                'username' => $username,
                'parent_email' => 'parent' . $i . '@example.com',
                'parent_phone' => '+1' . rand(2000000000, 9999999999),
                'password' => Hash::make('student123'),
                'date_of_birth' => now()->subYears(rand(6, 16))->format('Y-m-d'),
                'gender' => ['male', 'female'][rand(0, 1)],
                'age_group' => $ageGroup,
                'country' => 'USA',
                'state' => 'State ' . rand(1, 50),
                'city' => 'City ' . rand(1, 100),
                'status' => 'active',
                'account_type' => ['free', 'premium', 'enterprise'][rand(0, 2)],
                'registration_source' => 'admin_panel',
                'registration_type' => 'admin_created',
                'created_at' => now()->subDays(rand(0, 365)),
            ]);
        }
        
        // Create test student for login
        Student::create([
            'student_id' => 'STUTEST001',
            'student_code' => 'SKSTUDENT001',
            'first_name' => 'Test',
            'last_name' => 'Student',
            'username' => 'teststudent',
            'parent_email' => 'parent@example.com',
            'parent_phone' => '+1234567890',
            'password' => Hash::make('student123'),
            'age_group' => '12-14',
            'status' => 'active',
            'account_type' => 'premium',
            'country' => 'USA',
            'registration_source' => 'admin_panel',
            'registration_type' => 'admin_created',
            'created_at' => now()->subDays(30),
        ]);
        
        $this->command->info('✅ 31 students seeded successfully!');
        $this->command->info('📋 Test Student Login:');
        $this->command->info('   Username: teststudent');
        $this->command->info('   Password: student123');
        $this->command->info('   Student Code: SKSTUDENT001');
    }
}