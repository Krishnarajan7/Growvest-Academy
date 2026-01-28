<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductionContentResetSeeder extends Seeder
{
    public function run()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // DB::table('questions')->truncate();
        // DB::table('question_categories')->truncate();

        DB::table('media')->truncate();
        DB::table('media_albums')->truncate();
        DB::table('media_categories')->truncate();

//         DB::table('tags')->truncate();
//         DB::table('enrollments')->truncate();
//         DB::table('students')->truncate();
//         DB::table('tests')->truncate();
// DB::table('test_attempts')->truncate();
//         DB::table('activity_logs')->truncate();

        // DB::table('activity_log')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
}
