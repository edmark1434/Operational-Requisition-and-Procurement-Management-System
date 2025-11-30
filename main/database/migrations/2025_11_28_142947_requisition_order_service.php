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
        Schema::create('requisition_order_service', function (Blueprint $table) {
            $table->id();
            $table->foreignId('req_service_id')->constrained('requisition_services')->cascadeOnDelete();
            $table->foreignId('po_service_id')->constrained('order_services')->cascadeOnDelete();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requisition_order_service');

    }
};
