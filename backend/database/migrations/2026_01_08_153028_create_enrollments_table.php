<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->string('enrollment_id')->unique();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('course_id')->nullable();
            $table->foreignId('test_id')->nullable()->constrained()->onDelete('cascade');
            $table->enum('type', ['course', 'test', 'subscription']);
            $table->string('item_name');
            $table->decimal('price', 10, 2)->default(0);
            $table->enum('status', ['active', 'completed', 'cancelled', 'expired'])->default('active');
            $table->timestamp('enrolled_at');
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->json('progress')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['student_id', 'type', 'status']);
            $table->index(['type', 'enrolled_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enrollments');
    }
};