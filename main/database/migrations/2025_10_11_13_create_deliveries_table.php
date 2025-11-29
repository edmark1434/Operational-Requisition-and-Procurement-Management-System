<?php

use App\Models\Delivery;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('delivery', function (Blueprint $table) {
            $table->id();
            $table->string('ref_no', 50)->unique();
            $table->enum('type',Delivery::TYPES);
            $table->date('delivery_date');
            $table->decimal('total_cost', 15, 2);
            $table->string('receipt_no')->unique();
            $table->string('receipt_photo')->nullable();
            $table->enum('status',Delivery::STATUS)->default('Pending');
            $table->text('remarks')->nullable();
            $table->unsignedBigInteger('po_id')->nullable();
            $table->foreign('po_id')->references('id')->on('purchase_order')->onDelete('set null');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery');
    }
};
