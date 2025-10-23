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
        Schema::create('category_supplier', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('category')->cascadeOnDelete();
            $table->foreignId('supplier_id')->constrained('supplier')->cascadeOnDelete();
        });
        DB::unprepared("
            CREATE OR REPLACE PROCEDURE create_category_supplier(p_category_id INT, p_supplier_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO category_supplier (category_id, supplier_id)
                VALUES (p_category_id, p_supplier_id);
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE FUNCTION get_category_supplier(p_id INT DEFAULT NULL)
            RETURNS SETOF category_supplier
            LANGUAGE plpgsql
            AS $$
            BEGIN
                RETURN QUERY
                SELECT *
                FROM category_supplier
                WHERE id = COALESCE(p_id, id)
                ORDER BY id;
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE update_category_supplier(p_id INT, p_category_id INT, p_supplier_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                UPDATE category_supplier
                SET category_id = COALESCE(p_category_id, category_id),
                    supplier_id = COALESCE(p_supplier_id, supplier_id)
                WHERE id = p_id;
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE delete_category_supplier(p_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                DELETE FROM category_supplier WHERE id = p_id;
            END;
            $$;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('category_supplier');
        DB::unprepared('DROP PROCEDURE IF EXISTS create_category_supplier(INT, INT)');
        DB::unprepared('DROP PROCEDURE IF EXISTS update_category_supplier(INT, INT, INT)');
        DB::unprepared('DROP PROCEDURE IF EXISTS delete_category_supplier(INT)');
        DB::unprepared('DROP FUNCTION IF EXISTS get_category_supplier(INT)');
    }
};
