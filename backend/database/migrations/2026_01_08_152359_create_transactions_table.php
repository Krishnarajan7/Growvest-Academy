<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();

            $table->string('transaction_id')->nullable()->unique();
            $table->foreignId('student_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->string('type')->nullable();
            $table->string('description')->nullable();

            $table->decimal('amount', 10, 2)->default(0);
            $table->decimal('tax', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2)->default(0);

            $table->string('currency', 10)->default('USD');
            $table->string('payment_method')->nullable();

            $table->string('status')->default('pending')->index();

            $table->json('payment_details')->nullable();
            $table->string('invoice_url')->nullable();

            $table->timestamp('paid_at')->nullable();
            $table->timestamp('refunded_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
