<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use App\Models\Requisition;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('requisition', function (Blueprint $table) {
            $table->id();
            $table->enum('type',Requisition::TYPES);
            $table->timestamps();
            $table->enum('status',Requisition::STATUS);
            $table->string('remarks')->nullable();
            $table->string('requestor')->nullable();
            $table->string('notes')->nullable();    
            $table->string('priority', 15)->default('NORMAL');
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requisition');
    }
};
