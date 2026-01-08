<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media_albums', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('cover_image')->nullable();
            $table->enum('privacy', ['public', 'private', 'shared'])->default('public');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->unsignedInteger('media_count')->default(0);
            $table->foreignId('admin_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();
        });

        Schema::create('media_album_pivot', function (Blueprint $table) {
            $table->id();
            $table->foreignId('media_id')->constrained()->onDelete('cascade');
            $table->foreignId('album_id')->constrained('media_albums')->onDelete('cascade');
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
            
            $table->unique(['media_id', 'album_id']);
            $table->index(['album_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media_album_pivot');
        Schema::dropIfExists('media_albums');
    }
};