<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tests', function (Blueprint $table) {
            $table->id();
            $table->string('test_id')->unique();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->enum('type', ['quiz', 'exam', 'practice', 'assessment']);
            $table->string('category'); 
            $table->string('age_group'); 
            $table->integer('duration')->nullable(); 
            $table->integer('total_questions')->default(0);
            $table->integer('passing_score')->default(60);
            $table->integer('max_attempts')->default(1);
            $table->decimal('price', 10, 2)->default(0);
            $table->boolean('is_free')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();
            $table->json('settings')->nullable();
            $table->integer('total_attempts')->default(0);
            $table->decimal('average_score', 5, 2)->default(0);
            $table->decimal('completion_rate', 5, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['category', 'age_group']);
            $table->index(['type', 'is_active']);
        });

        Schema::create('test_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('test_id')->constrained()->onDelete('cascade');
            $table->foreignId('question_id')->constrained()->onDelete('cascade');
            $table->integer('order')->default(0);
            $table->integer('marks')->default(1);
            $table->timestamps();

            $table->unique(['test_id', 'question_id']);
            $table->index(['test_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('test_questions');
        Schema::dropIfExists('tests');
    }
};