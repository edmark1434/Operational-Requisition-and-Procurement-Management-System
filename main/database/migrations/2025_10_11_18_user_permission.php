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
        Schema::create('user_permission', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('perm_id')->constrained('permission')->cascadeOnDelete();
        });
        DB::unprepared("
            CREATE OR REPLACE FUNCTION get_user_permission(p_id INT DEFAULT NULL)
            RETURNS SETOF user_permission
            LANGUAGE plpgsql
            AS $$
            BEGIN
                RETURN QUERY
                SELECT * FROM user_permission
                WHERE id = COALESCE(p_id, id)
                ORDER BY id;
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE create_user_permission(
                p_user_id INT,
                p_perm_id INT
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO user_permission (user_id, perm_id)
                VALUES (p_user_id, p_perm_id);
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE update_user_permission(
                p_id INT,
                p_user_id INT DEFAULT NULL,
                p_perm_id INT DEFAULT NULL
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                UPDATE user_permission
                SET
                    user_id = COALESCE(p_user_id, user_id),
                    perm_id = COALESCE(p_perm_id, perm_id)
                WHERE id = p_id;
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE delete_user_permission(p_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                DELETE FROM user_permission WHERE id = p_id;
            END;
            $$;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_permission');
        DB::unprepared('DROP FUNCTION IF EXISTS get_user_permission(INT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS create_user_permission(INT, INT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS update_user_permission(INT, INT, INT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS delete_user_permission(INT);');
    }
};
