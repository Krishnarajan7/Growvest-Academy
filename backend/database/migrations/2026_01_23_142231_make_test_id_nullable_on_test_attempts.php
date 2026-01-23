<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
{
    Schema::table('test_attempts', function (Blueprint $table) {
        $table->unsignedBigInteger('test_id')->nullable()->change();
    });
}

public function down()
{
    Schema::table('test_attempts', function (Blueprint $table) {
        $table->unsignedBigInteger('test_id')->nullable(false)->change();
    });
}

};
