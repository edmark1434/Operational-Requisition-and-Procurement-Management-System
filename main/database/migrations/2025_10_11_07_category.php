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
        Schema::create('category', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
        });
        DB::unprepared("
            CREATE OR REPLACE FUNCTION get_category(p_id INT DEFAULT NULL)
            RETURNS SETOF category AS $$
            BEGIN
                RETURN QUERY
                SELECT * FROM category
                WHERE id = COALESCE(p_id, id)
                ORDER BY id;
            END;
            $$ LANGUAGE plpgsql;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE create_category(p_name VARCHAR(100))
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO category (name)
                VALUES (p_name);
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE update_category(p_id INT, p_name VARCHAR(100))
            LANGUAGE plpgsql
            AS $$
            BEGIN
                UPDATE category
                SET name = COALESCE(p_name, name)
                WHERE id = p_id;
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE delete_category(p_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                DELETE FROM category WHERE id = p_id;
            END;
            $$;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('category');
        DB::unprepared("DROP FUNCTION IF EXISTS get_category(INT);");
        DB::unprepared("DROP PROCEDURE IF EXISTS create_category(VARCHAR);");
        DB::unprepared("DROP PROCEDURE IF EXISTS update_category(INT, VARCHAR);");
        DB::unprepared("DROP PROCEDURE IF EXISTS delete_category(INT);");
    }
};
