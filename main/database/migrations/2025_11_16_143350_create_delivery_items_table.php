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
        Schema::create('delivery_item', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('delivery_id');
            $table->unsignedBigInteger('item_id');
            $table->foreign('delivery_id')->references('id')->on('delivery')->onDelete('set null');
            $table->foreign('item_id')->references('id')->on('item')->onDelete('set null');
            $table->integer('quantity')->default(0);
            $table->decimal('unit_price', 15, 2)->default(0);
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_item');
    }
};
