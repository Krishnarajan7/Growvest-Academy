<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->decimal('price', 10, 2)->default(0);
            $table->decimal('original_price', 10, 2)->nullable();
            $table->string('best_for')->nullable();        // e.g. "LKG - 2nd STD"
            $table->string('badge')->nullable();           // e.g. "LOW PRICE GREAT VALUE"
            $table->string('theme')->default('blue');      // card accent: green | blue | purple
            $table->text('description')->nullable();
            $table->json('features')->nullable();          // array of strings
            $table->string('image_path')->nullable();      // stored on the "public" disk
            $table->integer('order')->default(0);
            $table->boolean('in_stock')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
