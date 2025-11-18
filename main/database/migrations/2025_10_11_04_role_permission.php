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
        Schema::create('role_permission', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained('role')->cascadeOnDelete();
            $table->foreignId('perm_id')->constrained('permission')->cascadeOnDelete();
        });

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE seed_role_permission()
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO role_permission (role_id, perm_id)
                VALUES

                (1,1),(1,2),(1,4),(1,5),
                (1,6),(1,7),(1,8),
                (1,10),(1,11),(1,12),
                (1,13),(1,14),(1,16),

                (2,1),(2,3),
                (2,6),(2,8),(2,9),
                (2,10),
                (2,13),(2,15),
                (2,17),(2,18),
                (2,23),(2,24),

                (3,1),
                (3,6),
                (3,10),
                (3,13),
                (3,17),(3,18),
                (3,19),(3,20),
                (3,21),(3,22),
                (3,23),(3,24),
                (3,25),(3,26),(3,27),(3,28),(3,29),
                (3,30),(3,31),
                (3,32),(3,33);
            END;
            $$;
        ");

        DB::unprepared("CALL seed_role_permission();");

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
        DB::unprepared("DROP PROCEDURE IF EXISTS seed_role_permission();");
        DB::unprepared("DROP FUNCTION IF EXISTS get_role_permission(INT, INT, INT);");
        DB::unprepared("DROP PROCEDURE IF EXISTS create_role_permission(INT, INT);");
        DB::unprepared("DROP PROCEDURE IF EXISTS update_role_permission(INT, INT, INT);");
        DB::unprepared("DROP PROCEDURE IF EXISTS delete_role_permission(INT);");
    }
};
