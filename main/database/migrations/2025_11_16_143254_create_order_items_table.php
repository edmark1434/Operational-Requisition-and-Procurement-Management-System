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
        Schema::create('order_item', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('po_id')->nullable();
            $table->unsignedBigInteger('item_id')->nullable();
            $table->foreign('po_id')->references('id')->on('purchase_order')->onDelete('set null');
            $table->foreign('item_id')->references('id')->on('item')->onDelete('set null');
            $table->integer('quantity')->default(0);
        });

        // ==========================================================
        // FUNCTION: GET order_item (all or one)
        // ==========================================================
        DB::unprepared("
            CREATE OR REPLACE FUNCTION get_order_item(p_id INT DEFAULT NULL)
            RETURNS SETOF order_item
            LANGUAGE plpgsql
            AS $$
            BEGIN
                RETURN QUERY
                SELECT * FROM order_item
                WHERE id = COALESCE(p_id, id)
                ORDER BY id;
            END;
            $$;
        ");

        // ==========================================================
        // PROCEDURE: CREATE
        // ==========================================================
        DB::unprepared("
            CREATE OR REPLACE PROCEDURE create_order_item(
                p_po_id INT,
                p_item_id INT,
                p_quantity INT
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO order_item (po_id, item_id, quantity, created_at, updated_at)
                VALUES (p_po_id, p_item_id, p_quantity, NOW(), NOW());
            END;
            $$;
        ");

        // ==========================================================
        // PROCEDURE: UPDATE
        // ==========================================================
        DB::unprepared("
            CREATE OR REPLACE PROCEDURE update_order_item(
                p_id INT,
                p_po_id INT DEFAULT NULL,
                p_item_id INT DEFAULT NULL,
                p_quantity INT DEFAULT NULL
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                UPDATE order_item
                SET
                    po_id = COALESCE(p_po_id, po_id),
                    item_id = COALESCE(p_item_id, item_id),
                    quantity = COALESCE(p_quantity, quantity),
                    updated_at = NOW()
                WHERE id = p_id;
            END;
            $$;
        ");

        // ==========================================================
        // PROCEDURE: DELETE
        // ==========================================================
        DB::unprepared("
            CREATE OR REPLACE PROCEDURE delete_order_item(p_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                DELETE FROM order_item WHERE id = p_id;
            END;
            $$;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_item');

        DB::unprepared('DROP FUNCTION IF EXISTS get_order_item(INT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS create_order_item(INT, INT, INT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS update_order_item(INT, INT, INT, INT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS delete_order_item(INT);');
    }
};
