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
        Schema::create('requisition_item', function (Blueprint $table) {
            $table->id();
            $table->foreignId('req_id')->constrained('requisition')->cascadeOnDelete();
            $table->foreignId('item_id')->constrained('item')->cascadeOnDelete();
            $table->integer('quantity');
        });
        DB::unprepared("
            CREATE OR REPLACE PROCEDURE create_requisition_item(p_req_id INT, p_item_id INT, p_quantity INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO requisition_item (req_id, item_id, quantity)
                VALUES (p_req_id, p_item_id, p_quantity);
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE FUNCTION get_requisition_item(p_id INT DEFAULT NULL)
            RETURNS SETOF requisition_item
            LANGUAGE plpgsql
            AS $$
            BEGIN
                RETURN QUERY
                SELECT *
                FROM requisition_item
                WHERE id = COALESCE(p_id, id)
                ORDER BY id;
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE update_requisition_item(p_id INT, p_req_id INT, p_item_id INT, p_quantity INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                UPDATE requisition_item
                SET req_id = COALESCE(p_req_id, req_id),
                    item_id = COALESCE(p_item_id, item_id),
                    quantity = COALESCE(p_quantity, quantity)
                WHERE id = p_id;
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE delete_requisition_item(p_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                DELETE FROM requisition_item WHERE id = p_id;
            END;
            $$;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requisition_item');
        DB::unprepared('DROP PROCEDURE IF EXISTS create_requisition_item(INT, INT, INT)');
        DB::unprepared('DROP PROCEDURE IF EXISTS update_requisition_item(INT, INT, INT, INT)');
        DB::unprepared('DROP PROCEDURE IF EXISTS delete_requisition_item(INT)');
        DB::unprepared('DROP FUNCTION IF EXISTS get_requisition_item(INT)');
    }
};
