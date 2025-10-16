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
       Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->string('password', 255);
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
        });
        DB::unprepared("
            CREATE OR REPLACE FUNCTION get_users(p_id INT DEFAULT NULL)
            RETURNS SETOF users AS $$
            BEGIN
                RETURN QUERY
                SELECT * FROM users
                WHERE id = COALESCE(p_id, id)
                ORDER BY id;
            END;
            $$ LANGUAGE plpgsql;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE create_user(
                p_name VARCHAR,
                p_password VARCHAR
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO users (name, password)
                VALUES (p_name, p_password);
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE update_user(
                p_id INT,
                p_name VARCHAR DEFAULT NULL,
                p_password VARCHAR DEFAULT NULL
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                UPDATE users
                SET
                    name = COALESCE(p_name, name),
                    password = COALESCE(p_password, password)
                WHERE id = p_id;
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE delete_user(p_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                DELETE FROM users WHERE id = p_id;
            END;
            $$;
        ");

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
        DB::unprepared("DROP FUNCTION IF EXISTS get_users(INT);");
        DB::unprepared("DROP PROCEDURE IF EXISTS create_user(VARCHAR, VARCHAR);");
        DB::unprepared("DROP PROCEDURE IF EXISTS update_user(INT, VARCHAR, VARCHAR);");
        DB::unprepared("DROP PROCEDURE IF EXISTS delete_user(INT);");
    }
};
