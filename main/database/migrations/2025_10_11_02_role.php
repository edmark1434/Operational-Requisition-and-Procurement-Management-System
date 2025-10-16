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
        Schema::create('role', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('description', 255)->nullable();
        });
         DB::unprepared("
            CREATE OR REPLACE FUNCTION get_roles(p_id INT DEFAULT NULL)
            RETURNS SETOF role AS $$
            BEGIN
                RETURN QUERY
                SELECT * FROM role
                WHERE (p_id IS NULL OR id = p_id)
                ORDER BY id;
            END;
            $$ LANGUAGE plpgsql;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE create_role(p_name VARCHAR, p_description VARCHAR)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO role(name, description)
                VALUES (p_name, p_description);
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE update_role(p_id INT, p_name VARCHAR DEFAULT NULL, p_description VARCHAR DEFAULT NULL)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                UPDATE role
                SET
                    name = COALESCE(p_name, name),
                    description = COALESCE(p_description, description)
                WHERE id = p_id;
            END;
            $$;
        ");
        DB::unprepared("
            CREATE OR REPLACE PROCEDURE delete_role(p_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                DELETE FROM role WHERE id = p_id;
            END;
            $$;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role');
        DB::unprepared("DROP FUNCTION IF EXISTS get_roles(INT);");
        DB::unprepared("DROP PROCEDURE IF EXISTS create_role(VARCHAR, VARCHAR);");
        DB::unprepared("DROP PROCEDURE IF EXISTS update_role(INT, VARCHAR, VARCHAR);");
        DB::unprepared("DROP PROCEDURE IF EXISTS delete_role(INT);");
    }
};
