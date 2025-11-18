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
        Schema::create('setting', function (Blueprint $table) {
            $table->id();
            $table->string('category', 50)->nullable();
            $table->string('key', 50)->unique();
            $table->integer('value');
            $table->string('description', 255)->nullable();
        });

        DB::unprepared("
            CREATE OR REPLACE FUNCTION get_setting(p_id INT DEFAULT NULL)
            RETURNS SETOF setting
            LANGUAGE plpgsql
            AS $$
            BEGIN
                RETURN QUERY
                SELECT * FROM setting
                WHERE id = COALESCE(p_id, id)
                ORDER BY id;
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE seed_setting()
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO setting (key, description, value)
                VALUES
                (
                    'Low Stock Threshold',
                    'Number of items required to mark item inventory as “low stock”',
                    10
                ),
                (
                    'Requisition Item Quantity Limit',
                    'Maximum quantity of an item allowed for requisitions',
                    200
                ),
                (
                    'Purchase Order Amount Limit',
                    'Maximum total amount allowed for a purchase order',
                    50000
                );
            END;
            $$;
        ");

        DB::unprepared("CALL seed_setting();");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('setting');
        DB::unprepared('DROP FUNCTION IF EXISTS get_setting(INT);');
        DB::unprepared("DROP PROCEDURE IF EXISTS seed_setting();");
    }
};
