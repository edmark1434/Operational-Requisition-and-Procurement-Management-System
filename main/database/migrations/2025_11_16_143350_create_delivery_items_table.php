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
        Schema::create('delivery_item', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('purchase_id')->nullable();
            $table->unsignedBigInteger('item_id')->nullable();
            $table->foreign('purchase_id')->references('id')->on('purchase_order')->onDelete('set null');
            $table->foreign('item_id')->references('id')->on('item')->onDelete('set null');
            $table->integer('quantity')->default(0);
            $table->decimal('unit_price', 15, 2)->default(0);
        });

        // ==============================
        // FUNCTION: GET delivery_item
        // ==============================
        DB::unprepared("
            CREATE OR REPLACE FUNCTION get_delivery_item(p_id INT DEFAULT NULL)
            RETURNS SETOF delivery_item
            LANGUAGE plpgsql
            AS $$
            BEGIN
                RETURN QUERY
                SELECT * FROM delivery_item
                WHERE id = COALESCE(p_id, id)
                ORDER BY id;
            END;
            $$;
        ");

        // ==============================
        // PROCEDURE: CREATE
        // ==============================
        DB::unprepared("
            CREATE OR REPLACE PROCEDURE create_delivery_item(
                p_purchase_id BIGINT,
                p_item_id BIGINT,
                p_quantity INT,
                p_unit_price NUMERIC
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO delivery_item (purchase_id, item_id, quantity, unit_price)
                VALUES (p_purchase_id, p_item_id, p_quantity, p_unit_price);
            END;
            $$;
        ");

        // ==============================
        // PROCEDURE: UPDATE
        // ==============================
        DB::unprepared("
            CREATE OR REPLACE PROCEDURE update_delivery_item(
                p_id INT,
                p_purchase_id BIGINT DEFAULT NULL,
                p_item_id BIGINT DEFAULT NULL,
                p_quantity INT DEFAULT NULL,
                p_unit_price NUMERIC DEFAULT NULL
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                UPDATE delivery_item
                SET
                    purchase_id = COALESCE(p_purchase_id, purchase_id),
                    item_id = COALESCE(p_item_id, item_id),
                    quantity = COALESCE(p_quantity, quantity),
                    unit_price = COALESCE(p_unit_price, unit_price)
                WHERE id = p_id;
            END;
            $$;
        ");

        // ==============================
        // PROCEDURE: DELETE
        // ==============================
        DB::unprepared("
            CREATE OR REPLACE PROCEDURE delete_delivery_item(p_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                DELETE FROM delivery_item WHERE id = p_id;
            END;
            $$;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_item');

        DB::unprepared('DROP FUNCTION IF EXISTS get_delivery_item(INT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS create_delivery_item(BIGINT, BIGINT, INT, NUMERIC);');
        DB::unprepared('DROP PROCEDURE IF EXISTS update_delivery_item(INT, BIGINT, BIGINT, INT, NUMERIC);');
        DB::unprepared('DROP PROCEDURE IF EXISTS delete_delivery_item(INT);');
    }
};
