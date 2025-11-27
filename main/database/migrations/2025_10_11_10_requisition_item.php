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
        Schema::create('requisition_item', function (Blueprint $table) {
            $table->id();
            $table->foreignId('req_id')->constrained('requisition')->cascadeOnDelete();
            $table->foreignId('item_id')->constrained('item')->cascadeOnDelete();
            $table->integer('quantity');
            $table->integer('approved_qty');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requisition_item');
    }
};
