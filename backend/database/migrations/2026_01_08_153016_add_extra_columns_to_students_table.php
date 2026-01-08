<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            if (!Schema::hasColumn('students', 'registration_source')) {
                $table->string('registration_source')->nullable()->after('last_login_ip');
            }
            
            if (!Schema::hasColumn('students', 'country')) {
                $table->string('country')->nullable()->after('city');
            }
            
            if (!Schema::hasColumn('students', 'state')) {
                $table->string('state')->nullable()->after('country');
            }
            
            if (!Schema::hasColumn('students', 'city')) {
                $table->string('city')->nullable()->after('state');
            }
            
            if (!Schema::hasColumn('students', 'postal_code')) {
                $table->string('postal_code')->nullable()->after('address');
            }
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $columns = ['registration_source', 'country', 'state', 'city', 'postal_code'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('students', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};