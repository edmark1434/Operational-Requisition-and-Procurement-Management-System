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
        Schema::create('return', function (Blueprint $table) {
            $table->id();
            $table->dateTime('created_at');
            $table->date('return_date')->nullable();
            $table->enum('status', ['PENDING', 'REJECTED', 'DELIVERED', 'RECEIVED']);
            $table->string('remarks')->nullable();
            $table->foreignId('purchase_id')->constrained('purchase')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('return');
    }
};
