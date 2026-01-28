<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            AgeGroupSeeder::class,
            // StudentSeeder::class,
            QuestionCategorySeeder::class,
            // QuestionSeeder::class,
            ProductionContentResetSeeder::class,
            // MediaSeeder::class,
            // ActivityLogSeeder::class,
        ]);
    }
}
