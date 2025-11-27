<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\PurchaseOrder;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('purchase_order', function (Blueprint $table) {
            $table->id();
            $table->string('references_no')->unique();
            $table->enum('type',PurchaseOrder::TYPES);
            $table->timestamp('created_at')->useCurrent();
            $table->decimal('total_cost', 15, 2);
            $table->enum('payment_type', PurchaseOrder::PAYMENT_TYPE);
            $table->enum('status',PurchaseOrder::STATUS)->default('Pending');
            $table->text('remarks')->nullable();
            $table->unsignedBigInteger('req_id')->nullable();
            $table->unsignedBigInteger('vendor_id')->nullable();
            $table->foreign('req_id')->references('id')->on('requisition')->onDelete('set null');
            $table->foreign('vendor_id')->references('id')->on('vendor')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_order');
    }
};
