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
        Schema::create('rework_delivery', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rework_id')->constrained('reworks')->cascadeOnUpdate();
            $table->foreignId('old_delivery_id')->constrained('delivery')->cascadeOnUpdate();
            $table->foreignId('new_delivery_id')->nullable()->constrained('delivery')->cascadeOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rework_delivery');
    }
};
