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
        Schema::create('order_link', function (Blueprint $table) {
            $table->id();
            $table->foreignId('po_from_id')->constrained('purchase_order')->cascadeOnDelete();
            $table->foreignId('po_to_id')->constrained('purchase_order')->cascadeOnDelete();
        });

        // ===========================
        // SELECT (FUNCTION)
        // ===========================
        DB::unprepared("
            CREATE OR REPLACE FUNCTION get_order_link(p_id INT DEFAULT NULL)
            RETURNS SETOF order_link
            LANGUAGE plpgsql
            AS $$
            BEGIN
                RETURN QUERY
                SELECT * FROM order_link
                WHERE id = COALESCE(p_id, id)
                ORDER BY id;
            END;
            $$;
        ");

        // ===========================
        // CREATE (PROCEDURE)
        // ===========================
        DB::unprepared("
            CREATE OR REPLACE PROCEDURE create_order_link(
                p_po_from_id INT,
                p_po_to_id INT
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO order_link (po_from_id, po_to_id)
                VALUES (p_po_from_id, p_po_to_id);
            END;
            $$;
        ");

        // ===========================
        // UPDATE (PROCEDURE)
        // ===========================
        DB::unprepared("
            CREATE OR REPLACE PROCEDURE update_order_link(
                p_id INT,
                p_po_from_id INT DEFAULT NULL,
                p_po_to_id INT DEFAULT NULL
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                UPDATE order_link
                SET
                    po_from_id = COALESCE(p_po_from_id, po_from_id),
                    po_to_id   = COALESCE(p_po_to_id, po_to_id)
                WHERE id = p_id;
            END;
            $$;
        ");

        // ===========================
        // DELETE (PROCEDURE)
        // ===========================
        DB::unprepared("
            CREATE OR REPLACE PROCEDURE delete_order_link(p_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                DELETE FROM order_link WHERE id = p_id;
            END;
            $$;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_link');

        DB::unprepared('DROP FUNCTION IF EXISTS get_order_link(INT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS create_order_link(INT, INT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS update_order_link(INT, INT, INT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS delete_order_link(INT);');
    }
};
