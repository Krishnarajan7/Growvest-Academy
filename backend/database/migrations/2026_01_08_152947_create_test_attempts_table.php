<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('test_attempts', function (Blueprint $table) {
            $table->id();
            $table->string('attempt_id')->unique();
            $table->foreignId('test_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->integer('attempt_number')->default(1);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->integer('time_spent')->nullable(); // in seconds
            $table->integer('total_questions')->default(0);
            $table->integer('questions_attempted')->default(0);
            $table->integer('correct_answers')->default(0);
            $table->decimal('score', 5, 2)->default(0);
            $table->decimal('percentage', 5, 2)->default(0);
            $table->enum('status', ['in_progress', 'completed', 'abandoned', 'timed_out'])->default('in_progress');
            $table->json('answers')->nullable();
            $table->json('result_details')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['test_id', 'student_id']);
            $table->index(['student_id', 'status']);
            $table->index('completed_at');
        });

        Schema::create('test_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_id')->constrained('test_attempts')->onDelete('cascade');
            $table->foreignId('question_id')->constrained()->onDelete('cascade');
            $table->string('selected_option')->nullable();
            $table->boolean('is_correct')->default(false);
            $table->integer('time_taken')->nullable(); // in seconds
            $table->timestamps();

            $table->unique(['attempt_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('test_answers');
        Schema::dropIfExists('test_attempts');
    }
};