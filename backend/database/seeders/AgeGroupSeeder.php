<?php

namespace Database\Seeders;

use App\Models\AgeGroup;
use Illuminate\Database\Seeder;

class AgeGroupSeeder extends Seeder
{
    public function run(): void
    {
        $ageGroups = [
            [
                'name' => '6-8 Years',
                'slug' => '6-8',
                'min_age' => '6',
                'max_age' => '8',
                'description' => 'Early primary school age group',
                'order' => 1,
                'is_active' => true
            ],
            [
                'name' => '9-11 Years',
                'slug' => '9-11',
                'min_age' => '9',
                'max_age' => '11',
                'description' => 'Upper primary school age group',
                'order' => 2,
                'is_active' => true
            ],
            [
                'name' => '12-14 Years',
                'slug' => '12-14',
                'min_age' => '12',
                'max_age' => '14',
                'description' => 'Middle school age group',
                'order' => 3,
                'is_active' => true
            ],
            [
                'name' => '15-16 Years',
                'slug' => '15-16',
                'min_age' => '15',
                'max_age' => '16',
                'description' => 'High school age group',
                'order' => 4,
                'is_active' => true
            ]
        ];

        foreach ($ageGroups as $ageGroup) {
            AgeGroup::create($ageGroup);
        }
    }
}