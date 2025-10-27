<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('audit_log', function (Blueprint $table) {
            $table->id();
            $table->string('type', 255);
            $table->text('description');
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete()->cascadeOnUpdate();
        });

        DB::unprepared("
            CREATE OR REPLACE FUNCTION get_audit_log(p_id INT, p_userId INT, p_type VARCHAR)
            RETURNS SETOF audit_log AS $$
            BEGIN
                RETURN QUERY
                SELECT *
                FROM audit_log
                WHERE (p_id IS NULL OR audit_log.id = p_id)
                AND (p_userId IS NULL OR audit_log.user_id = p_userId)
                AND (p_type IS NULL OR audit_log.type = p_type)
                ORDER BY audit_log.created_at DESC;
            END;
            $$ LANGUAGE plpgsql;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE create_audit_log(p_type VARCHAR, p_description VARCHAR, p_userId INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO audit_log (type, description, user_id)
                VALUES (p_type, p_description, p_userId);
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE update_audit_log(p_id INT, p_type VARCHAR, p_description VARCHAR)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                UPDATE audit_log
                SET
                    type = COALESCE(p_type, type),
                    description = COALESCE(p_description, description)
                WHERE id = p_id;
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE delete_audit_log(p_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                DELETE FROM audit_log WHERE id = p_id;
            END;
            $$;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_log');

        DB::unprepared("DROP FUNCTION IF EXISTS get_audit_log(INT, INT, VARCHAR);");
        DB::unprepared("DROP PROCEDURE IF EXISTS create_audit_log(VARCHAR, VARCHAR, INT);");
        DB::unprepared("DROP PROCEDURE IF EXISTS update_audit_log(INT, VARCHAR, VARCHAR);");
        DB::unprepared("DROP PROCEDURE IF EXISTS delete_audit_log(INT);");
    }
};
