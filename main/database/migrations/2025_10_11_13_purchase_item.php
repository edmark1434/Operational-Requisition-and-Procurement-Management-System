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
        Schema::create('purchase_item', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_id')->constrained('purchase')->cascadeOnDelete();
            $table->foreignId('item_id')->constrained('item')->cascadeOnDelete();
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
        });
        DB::unprepared("
            CREATE OR REPLACE FUNCTION get_purchase_item(p_id INT DEFAULT NULL)
            RETURNS SETOF purchase_item
            LANGUAGE plpgsql
            AS $$
            BEGIN
                RETURN QUERY
                SELECT * FROM purchase_item
                WHERE id = COALESCE(p_id, id)
                ORDER BY id;
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE create_purchase_item(
                p_purchase_id INT,
                p_item_id INT,
                p_quantity INT,
                p_unit_price DECIMAL
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO purchase_item (purchase_id, item_id, quantity, unit_price)
                VALUES (p_purchase_id, p_item_id, p_quantity, p_unit_price);
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE update_purchase_item(
                p_id INT,
                p_purchase_id INT DEFAULT NULL,
                p_item_id INT DEFAULT NULL,
                p_quantity INT DEFAULT NULL,
                p_unit_price DECIMAL DEFAULT NULL
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                UPDATE purchase_item
                SET
                    purchase_id = COALESCE(p_purchase_id, purchase_id),
                    item_id     = COALESCE(p_item_id, item_id),
                    quantity    = COALESCE(p_quantity, quantity),
                    unit_price  = COALESCE(p_unit_price, unit_price)
                WHERE id = p_id;
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE delete_purchase_item(p_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                DELETE FROM purchase_item WHERE id = p_id;
            END;
            $$;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_item');
        DB::unprepared('DROP FUNCTION IF EXISTS get_purchase_item(INT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS create_purchase_item(INT, INT, INT, DECIMAL);');
        DB::unprepared('DROP PROCEDURE IF EXISTS update_purchase_item(INT, INT, INT, INT, DECIMAL);');
        DB::unprepared('DROP PROCEDURE IF EXISTS delete_purchase_item(INT);');
    }
};
