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
        Schema::create('audit_log', function (Blueprint $table) {
            $table->id();
            $table->enum('type', [
                'REQUISITION_APPROVAL',
                'REQUISITION_REJECTION',
                'REQUISITION_CHANGE',
                'SETTING_CHANGE',
                'SUPPLIER_UPDATE',
                'PERMISSION_UPDATE'
            ]);
            $table->string('description', 255);
            $table->dateTime('created_at');
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete()->casca;
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_log');
    }
};
