<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->foreignId('admin_id')->nullable()->constrained()->onDelete('set null');
            $table->string('name');
            $table->string('original_name');
            $table->string('path');
            $table->string('url');
            $table->string('thumbnail_url')->nullable();
            $table->string('type'); // image, video, document, audio
            $table->string('mime_type');
            $table->string('extension');
            $table->unsignedBigInteger('size'); // in bytes
            $table->json('dimensions')->nullable(); // width, height for images/videos
            $table->string('duration')->nullable(); // for videos/audio
            $table->enum('visibility', ['public', 'private', 'protected'])->default('public');
            $table->enum('status', ['active', 'inactive', 'archived'])->default('active');
            $table->json('metadata')->nullable(); // exif data, video codec, etc.
            $table->string('storage_driver')->default('local'); // local, s3, cloudinary, etc.
            $table->string('cdn_url')->nullable();
            $table->string('optimized_url')->nullable();
            $table->unsignedInteger('download_count')->default(0);
            $table->unsignedInteger('view_count')->default(0);
            $table->text('alt_text')->nullable();
            $table->text('caption')->nullable();
            $table->text('description')->nullable();
            $table->json('tags')->nullable();
            $table->softDeletes();
            $table->timestamps();
            
            $table->index(['type', 'status']);
            $table->index(['admin_id', 'created_at']);
            $table->index('visibility');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};