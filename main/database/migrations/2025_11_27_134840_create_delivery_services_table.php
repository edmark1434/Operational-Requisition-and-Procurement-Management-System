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
        Schema::create('delivery_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('delivery_id')->constrained('delivery')->cascadeOnUpdate();
            $table->foreignId('service_id')->constrained('services')->cascadeOnUpdate();
            $table->foreignId('item_id')->nullable()->constrained('item')->cascadeOnUpdate();
            $table->decimal('hourly_rate');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_services');
    }
};
