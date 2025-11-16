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
        Schema::create('supplier', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->string('contact_info', 255)->nullable();
            $table->boolean('allows_cash');
            $table->boolean('allows_disbursement');
            $table->boolean('allows_store_credit');
        });
        DB::unprepared("
            CREATE OR REPLACE FUNCTION get_supplier(p_id INT DEFAULT NULL)
            RETURNS SETOF supplier AS $$
            BEGIN
                RETURN QUERY
                SELECT * FROM supplier
                WHERE id = COALESCE(p_id, id)
                ORDER BY id;
            END;
            $$ LANGUAGE plpgsql;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE create_supplier(
                p_name VARCHAR(100),
                p_contact_info VARCHAR(255),
                p_allows_cash BOOLEAN,
                p_allows_disbursement BOOLEAN,
                p_allows_store_credit BOOLEAN
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO supplier (name, contact_info, allows_cash, allows_disbursement, allows_store_credit)
                VALUES (p_name, p_contact_info, p_allows_cash, p_allows_disbursement, p_allows_store_credit);
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE update_supplier(
                p_id INT,
                p_name VARCHAR(100),
                p_contact_info VARCHAR(255),
                p_allows_cash BOOLEAN,
                p_allows_disbursement BOOLEAN,
                p_allows_store_credit BOOLEAN
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                UPDATE supplier
                SET
                    name = COALESCE(p_name, name),
                    contact_info = COALESCE(p_contact_info, contact_info),
                    allows_cash = COALESCE(p_allows_cash, allows_cash),
                    allows_disbursement = COALESCE(p_allows_disbursement, allows_disbursement),
                    allows_store_credit = COALESCE(p_allows_store_credit, allows_store_credit)
                WHERE id = p_id;
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE delete_supplier(p_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                DELETE FROM supplier WHERE id = p_id;
            END;
            $$;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supplier');
        DB::unprepared("DROP FUNCTION IF EXISTS get_supplier(INT);");
        DB::unprepared("DROP PROCEDURE IF EXISTS create_supplier(VARCHAR, VARCHAR, BOOLEAN, BOOLEAN, BOOLEAN);");
        DB::unprepared("DROP PROCEDURE IF EXISTS update_supplier(INT, VARCHAR, VARCHAR, BOOLEAN, BOOLEAN, BOOLEAN);");
        DB::unprepared("DROP PROCEDURE IF EXISTS delete_supplier(INT);");
    }
};
