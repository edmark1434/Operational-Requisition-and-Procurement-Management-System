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
        Schema::create('order_link', function (Blueprint $table) {
            $table->id();
            $table->foreignId('po_from_id')->constrained('purchase_order')->cascadeOnDelete();
            $table->foreignId('po_to_id')->constrained('purchase_order')->cascadeOnDelete();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_link');

    }
};
