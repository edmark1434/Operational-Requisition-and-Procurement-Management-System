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
        Schema::create('role', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('description', 255)->nullable();
            $table->boolean('is_active')->default(true);
        });
        DB::unprepared("
            CREATE OR REPLACE PROCEDURE seed_role()
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO role (name, description)
                VALUES
                (
                    'Encoder',
                    'Records requisitions, deliveries and returns, and merges purchase orders to ready for issuance'
                ),
                (
                    'Manager',
                    'Manages inventory, approves requisitions and issues purchase orders and returns'
                ),
                (
                    'Administrator',
                    'Manages users, roles and permissions, suppliers, settings, as well as the list of items, makes, and categories'
                ),(
                    'Requestor',
                    'Creates purchase requests, tracks request status, and views approved items'
                );
            END;
            $$;
        ");

        DB::unprepared("CALL seed_role();");
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role');
        DB::unprepared("DROP PROCEDURE IF EXISTS seed_role();");
    }
};
