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
        Schema::create('make', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
        });
         DB::unprepared("
            CREATE OR REPLACE FUNCTION get_make(p_id INT DEFAULT NULL)
            RETURNS SETOF make AS $$
            BEGIN
                RETURN QUERY
                SELECT * FROM make
                WHERE id = COALESCE(p_id, id)
                ORDER BY id;
            END;
            $$ LANGUAGE plpgsql;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE create_make(p_name VARCHAR(100))
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO make (name)
                VALUES (p_name);
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE update_make(p_id INT, p_name VARCHAR(100))
            LANGUAGE plpgsql
            AS $$
            BEGIN
                UPDATE make
                SET name = p_name
                WHERE id = p_id;
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE delete_make(p_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                DELETE FROM make WHERE id = p_id;
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
        DB::unprepared("DROP FUNCTION IF EXISTS get_make(INT);");
        DB::unprepared("DROP PROCEDURE IF EXISTS create_make(VARCHAR);");
        DB::unprepared("DROP PROCEDURE IF EXISTS update_make(INT, VARCHAR);");
        DB::unprepared("DROP PROCEDURE IF EXISTS delete_make(INT);");
    }
};
