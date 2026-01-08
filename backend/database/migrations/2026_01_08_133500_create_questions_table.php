<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();

            $table->text('question');
            $table->text('explanation')->nullable();

            $table->string('category')->index();
            $table->string('age_group')->index();
            $table->string('difficulty')->index();

            $table->json('options');

            $table->boolean('is_active')->default(true);
            $table->integer('order')->default(0);

            $table->unsignedInteger('view_count')->default(0);
            $table->unsignedInteger('attempt_count')->default(0);
            $table->unsignedInteger('correct_count')->default(0);

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('admins')
                ->nullOnDelete();

            $table->foreignId('updated_by')
                ->nullable()
                ->constrained('admins')
                ->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['category', 'age_group', 'difficulty']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
