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
        Schema::create('role_permission', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained('role')->cascadeOnDelete();
            $table->foreignId('perm_id')->constrained('permission')->cascadeOnDelete();
        });
        DB::unprepared("
            CREATE OR REPLACE FUNCTION get_role_permission(p_id INT DEFAULT NULL, p_role_id INT DEFAULT NULL, p_perm_id INT DEFAULT NULL)
            RETURNS SETOF role_permission AS $$
            BEGIN
                RETURN QUERY
                SELECT * FROM role_permission
                WHERE 
                    id = COALESCE(p_id, id) AND
                    role_id = COALESCE(p_role_id, role_id) AND
                    perm_id = COALESCE(p_perm_id, perm_id)
                ORDER BY id;
            END;
            $$ LANGUAGE plpgsql;
        ");
        DB::unprepared("
            CREATE OR REPLACE PROCEDURE create_role_permission(p_role_id INT, p_perm_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO role_permission(role_id, perm_id)
                VALUES (p_role_id, p_perm_id);
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE update_role_permission(p_id INT, p_role_id INT DEFAULT NULL, p_perm_id INT DEFAULT NULL)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                UPDATE role_permission
                SET
                    role_id = COALESCE(p_role_id, role_id),
                    perm_id = COALESCE(p_perm_id, perm_id)
                WHERE id = p_id;
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE delete_role_permission(p_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                DELETE FROM role_permission WHERE id = p_id;
            END;
            $$;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_permission');
        DB::unprepared("DROP FUNCTION IF EXISTS get_role_permission(INT, INT, INT);");
        DB::unprepared("DROP PROCEDURE IF EXISTS create_role_permission(INT, INT);");
        DB::unprepared("DROP PROCEDURE IF EXISTS update_role_permission(INT, INT, INT);");
        DB::unprepared("DROP PROCEDURE IF EXISTS delete_role_permission(INT);");
    }
};
