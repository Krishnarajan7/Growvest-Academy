<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {

            // Email: make nullable only if column exists
            if (Schema::hasColumn('students', 'email')) {
                $table->string('email')->nullable()->change();
            }

            // Username
            if (!Schema::hasColumn('students', 'username')) {
                $table->string('username')->unique()->after('last_name');
            }

            // Parent email
            if (!Schema::hasColumn('students', 'parent_email')) {
                $table->string('parent_email')->nullable()->after('email');
            }

            // Parent phone
            if (!Schema::hasColumn('students', 'parent_phone')) {
                $table->string('parent_phone')->nullable()->after('parent_email');
            }

            // Student code
            if (!Schema::hasColumn('students', 'student_code')) {
                $table->string('student_code')->unique()->after('student_id');
            }

            // Registration type
            if (!Schema::hasColumn('students', 'registration_type')) {
                $table->enum(
                    'registration_type',
                    ['admin_created', 'self_registered']
                )->default('admin_created')->after('registration_source');
            }
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {

            if (Schema::hasColumn('students', 'username')) {
                $table->dropColumn('username');
            }

            if (Schema::hasColumn('students', 'parent_email')) {
                $table->dropColumn('parent_email');
            }

            if (Schema::hasColumn('students', 'parent_phone')) {
                $table->dropColumn('parent_phone');
            }

            if (Schema::hasColumn('students', 'student_code')) {
                $table->dropColumn('student_code');
            }

            if (Schema::hasColumn('students', 'registration_type')) {
                $table->dropColumn('registration_type');
            }

            if (Schema::hasColumn('students', 'email')) {
                $table->string('email')->nullable(false)->change();
            }
        });
    }
};
