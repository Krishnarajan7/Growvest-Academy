<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->foreign('parent_id')->references('id')->on('media_categories')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('media_category_pivot', function (Blueprint $table) {
            $table->id();
            $table->foreignId('media_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained('media_categories')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['media_id', 'category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media_category_pivot');
        Schema::dropIfExists('media_categories');
    }
};