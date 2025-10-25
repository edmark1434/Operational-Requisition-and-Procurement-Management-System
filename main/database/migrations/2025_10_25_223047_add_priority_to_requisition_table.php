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
        Schema::table('requisition', function (Blueprint $table) {
            // Add the new 'priority' column as a VARCHAR(15)
            $table->string('priority', 15)->after('notes')->default('NORMAL');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requisition', function (Blueprint $table) {
            // Drop the column if rolling back
            $table->dropColumn('priority');
        });
    }
};
