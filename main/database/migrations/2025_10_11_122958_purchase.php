<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('purchase', function (Blueprint $table) {
            $table->id();
            $table->date('purchase_date');
            $table->decimal('total_cost', 10, 2);
            $table->integer('receipt_no')->nullable();
            $table->string('receipt_photo', 255)->nullable();
            $table->enum('payment_type', ['CASH', 'STORE_CREDIT', 'DISBURSEMENT'])->nullable();
            $table->foreignId('req_id')->nullable()->constrained('requisition')->nullOnDelete();
            $table->foreignId('supplier_id')->constrained('supplier')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase');
    }
};
