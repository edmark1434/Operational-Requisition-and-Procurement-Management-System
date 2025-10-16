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
        Schema::create('permission', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique();
        });
        DB::unprepared("
            CREATE OR REPLACE FUNCTION get_permission(p_id INT DEFAULT NULL)
            RETURNS SETOF permission AS $$
            BEGIN
                RETURN QUERY
                SELECT * FROM permission
                WHERE id = COALESCE(p_id, id)
                ORDER BY id;
            END;
            $$ LANGUAGE plpgsql;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE create_permission(p_name VARCHAR)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO permission(name)
                VALUES (p_name);
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE update_permission(p_id INT, p_name VARCHAR DEFAULT NULL)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                UPDATE permission
                SET
                    name = COALESCE(p_name, name)
                WHERE id = p_id;
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE delete_permission(p_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                DELETE FROM permission WHERE id = p_id;
            END;
            $$;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permission');
        DB::unprepared("DROP FUNCTION IF EXISTS get_permission(INT);");
        DB::unprepared("DROP PROCEDURE IF EXISTS create_permission(VARCHAR);");
        DB::unprepared("DROP PROCEDURE IF EXISTS update_permission(INT, VARCHAR);");
        DB::unprepared("DROP PROCEDURE IF EXISTS delete_permission(INT);");
    }
};
