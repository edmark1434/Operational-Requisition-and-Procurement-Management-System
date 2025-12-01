<?php

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
        Schema::create('requisition_order_item', function (Blueprint $table) {
            $table->id();
            $table->foreignId('req_item_id')->constrained('requisition_item')->cascadeOnDelete();
            $table->foreignId('po_item_id')->constrained('order_item')->cascadeOnDelete();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requisition_order_item');

    }
};
