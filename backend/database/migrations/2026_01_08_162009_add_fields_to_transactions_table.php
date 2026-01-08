<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up()
{
    Schema::table('transactions', function (Blueprint $table) {

        if (!Schema::hasColumn('transactions', 'transaction_id')) {
            $table->string('transaction_id')->nullable()->unique();
        }

        if (!Schema::hasColumn('transactions', 'student_id')) {
            $table->foreignId('student_id')->nullable()->constrained()->nullOnDelete();
        }

        if (!Schema::hasColumn('transactions', 'type')) {
            $table->string('type')->nullable();
        }

        if (!Schema::hasColumn('transactions', 'description')) {
            $table->string('description')->nullable();
        }

        if (!Schema::hasColumn('transactions', 'amount')) {
            $table->decimal('amount', 10, 2)->default(0);
        }

        if (!Schema::hasColumn('transactions', 'tax')) {
            $table->decimal('tax', 10, 2)->default(0);
        }

        if (!Schema::hasColumn('transactions', 'total_amount')) {
            $table->decimal('total_amount', 10, 2)->default(0);
        }

        if (!Schema::hasColumn('transactions', 'currency')) {
            $table->string('currency', 10)->default('USD');
        }

        if (!Schema::hasColumn('transactions', 'payment_method')) {
            $table->string('payment_method')->nullable();
        }

        if (!Schema::hasColumn('transactions', 'status')) {
            $table->string('status')->default('pending');
        }

        if (!Schema::hasColumn('transactions', 'payment_details')) {
            $table->json('payment_details')->nullable();
        }

        if (!Schema::hasColumn('transactions', 'paid_at')) {
            $table->timestamp('paid_at')->nullable();
        }

        if (!Schema::hasColumn('transactions', 'refunded_at')) {
            $table->timestamp('refunded_at')->nullable();
        }

        if (!Schema::hasColumn('transactions', 'deleted_at')) {
            $table->softDeletes();
        }
    });
}


public function down()
{
    Schema::table('transactions', function (Blueprint $table) {
        $table->dropColumn([
            'student_id','transaction_id','type','description','amount',
            'tax','total_amount','currency','payment_method','status',
            'payment_details','paid_at','refunded_at','deleted_at'
        ]);
    });
}

};
