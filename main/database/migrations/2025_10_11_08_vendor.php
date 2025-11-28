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
        Schema::create('vendor', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->string('email')->unique();
            $table->string('contact_number', 255)->nullable();
            $table->boolean('allows_cash');
            $table->boolean('allows_disbursement');
            $table->boolean('allows_store_credit');
            $table->boolean('is_active')->default(true);
        });
       
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor');
    }
};
