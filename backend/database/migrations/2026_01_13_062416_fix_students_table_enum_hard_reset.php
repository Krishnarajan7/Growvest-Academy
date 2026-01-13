<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        /**
         * STEP 1: Temporarily relax columns to VARCHAR
         * (prevents enum validation failure)
         */
        DB::statement("
            ALTER TABLE students
            MODIFY registration_type VARCHAR(50) NULL
        ");

        DB::statement("
            ALTER TABLE students
            MODIFY account_type VARCHAR(50) NULL
        ");

        /**
         * STEP 2: Normalize invalid data
         */
        DB::statement("
            UPDATE students
            SET registration_type = 'guest'
            WHERE registration_type IS NULL
               OR registration_type NOT IN (
                   'guest','manual','google','facebook',
                   'enterprise','basic','trial','unknown'
               )
        ");

        DB::statement("
            UPDATE students
            SET account_type = 'free'
            WHERE account_type IS NULL
               OR account_type NOT IN (
                   'free','premium','enterprise','basic','trial','unknown'
               )
        ");

        /**
         * STEP 3: Convert back to ENUM safely
         */
        DB::statement("
            ALTER TABLE students
            MODIFY registration_type
            ENUM(
                'guest','manual','google','facebook',
                'enterprise','basic','trial','unknown'
            )
            DEFAULT 'guest'
        ");

        DB::statement("
            ALTER TABLE students
            MODIFY account_type
            ENUM(
                'free','premium','enterprise',
                'basic','trial','unknown'
            )
            DEFAULT 'free'
        ");

        /**
         * STEP 4: Nullable columns
         */
        Schema::table('students', function (Blueprint $table) {
            $table->string('last_name')->nullable()->change();
            $table->string('student_code')->nullable()->change();
            $table->string('email')->nullable()->change();
            $table->string('parent_email')->nullable()->change();
            $table->string('phone')->nullable()->change();
            $table->string('parent_phone')->nullable()->change();
        });
    }

    public function down(): void
    {
        // Intentionally left empty (enum rollback is unsafe)
    }
};
