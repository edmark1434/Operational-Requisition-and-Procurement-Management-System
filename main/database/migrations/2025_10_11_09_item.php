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
        Schema::create('item', function (Blueprint $table) {
            $table->id();
            $table->string('barcode',20)->unique()->nullable();
            $table->string('name', 100);
            $table->string('dimensions', 50)->nullable();
            $table->decimal('unit_price', 10, 2);
            $table->integer('current_stock');
            $table->foreignId('make_id')->nullable()->constrained('make')->nullOnDelete();
            $table->foreignId('category_id')->constrained('category')->cascadeOnDelete();
            $table->foreignId('supplier_id')->nullable()->constrained('supplier')->nullOnDelete();
        });
        DB::unprepared("
            CREATE OR REPLACE FUNCTION get_item(
                p_id INT DEFAULT NULL,
                p_category_id INT DEFAULT NULL,
                p_make_id INT DEFAULT NULL,
                p_supplier_id INT DEFAULT NULL
            )
            RETURNS SETOF item AS $$
            BEGIN
                RETURN QUERY
                SELECT * FROM item
                WHERE
                    id = COALESCE(p_id, id) AND
                    category_id = COALESCE(p_category_id, category_id) AND
                    make_id = COALESCE(p_make_id, make_id) AND 
                    supplier_id = COALESCE(p_supplier_id, supplier_id)

                ORDER BY name;
            END;
            $$ LANGUAGE plpgsql;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE create_item(
                p_barcode INT,
                p_name VARCHAR,
                p_dimensions VARCHAR,
                p_unit_price DECIMAL,
                p_current_stock INT,
                p_make_id INT,
                p_category_id INT,
                p_supplier_id INT
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO item (barcode, name, dimensions, unit_price, current_stock, make_id, category_id, supplier_id)
                VALUES (p_barcode, p_name, p_dimensions, p_unit_price, p_current_stock, p_make_id, p_category_id, p_supplier_id);
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE update_item(
                p_id INT,
                p_barcode INT DEFAULT NULL,
                p_name VARCHAR DEFAULT NULL,
                p_dimensions VARCHAR DEFAULT NULL,
                p_unit_price DECIMAL DEFAULT NULL,
                p_current_stock INT DEFAULT NULL,
                p_make_id INT DEFAULT NULL,
                p_category_id INT DEFAULT NULL,
                p_supplier_id INT DEFAULT NULL
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                UPDATE item
                SET
                    barcode       = COALESCE(p_barcode, barcode),
                    name          = COALESCE(p_name, name),
                    dimensions    = COALESCE(p_dimensions, dimensions),
                    unit_price    = COALESCE(p_unit_price, unit_price),
                    current_stock = COALESCE(p_current_stock, current_stock),
                    make_id       = COALESCE(p_make_id, make_id),
                    category_id   = COALESCE(p_category_id, category_id),
                    supplier_id   = COALESCE(p_supplier_id, supplier_id)
                WHERE id = p_id;
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE delete_item(p_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                DELETE FROM item WHERE id = p_id;
            END;
            $$;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item');
        DB::unprepared("DROP FUNCTION IF EXISTS get_item(INT, INT, INT);");
        DB::unprepared("DROP PROCEDURE IF EXISTS create_item(INT, VARCHAR, VARCHAR, DECIMAL, INT, INT, INT);");
        DB::unprepared("DROP PROCEDURE IF EXISTS update_item(INT, INT, VARCHAR, VARCHAR, DECIMAL, INT, INT, INT);");
        DB::unprepared("DROP PROCEDURE IF EXISTS delete_item(INT);");
    }
};
