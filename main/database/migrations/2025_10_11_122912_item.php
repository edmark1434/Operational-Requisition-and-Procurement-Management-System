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
        Schema::create('item', function (Blueprint $table) {
            $table->id();
            $table->integer('barcode')->unique()->nullable();
            $table->string('name', 100);
            $table->string('dimensions', 50)->nullable();
            $table->decimal('unit_price', 10, 2);
            $table->integer('current_stock');
            $table->foreignId('make_id')->nullable()->constrained('make')->nullOnDelete();
            $table->foreignId('category_id')->constrained('category')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item');
    }
};
