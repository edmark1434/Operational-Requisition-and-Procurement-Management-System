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
        Schema::create('setting', function (Blueprint $table) {
            $table->id();
            $table->string('category', 50);
            $table->string('key', 50)->unique();
            $table->string('value', 255)->nullable();
            $table->string('description', 255)->nullable();
        });
        DB::unprepared("
            CREATE OR REPLACE FUNCTION get_setting(p_id INT DEFAULT NULL)
            RETURNS SETOF setting
            LANGUAGE plpgsql
            AS $$
            BEGIN
                RETURN QUERY
                SELECT * FROM setting
                WHERE id = COALESCE(p_id, id)
                ORDER BY id;
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE create_setting(
                p_category VARCHAR(50),
                p_key VARCHAR(50),
                p_value VARCHAR(255) DEFAULT NULL,
                p_description VARCHAR(255) DEFAULT NULL
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO setting (category, key, value, description)
                VALUES (p_category, p_key, p_value, p_description);
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE update_setting(
                p_id INT,
                p_category VARCHAR(50) DEFAULT NULL,
                p_key VARCHAR(50) DEFAULT NULL,
                p_value VARCHAR(255) DEFAULT NULL,
                p_description VARCHAR(255) DEFAULT NULL
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                UPDATE setting
                SET
                    category    = COALESCE(p_category, category),
                    key         = COALESCE(p_key, key),
                    value       = COALESCE(p_value, value),
                    description = COALESCE(p_description, description)
                WHERE id = p_id;
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE delete_setting(p_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                DELETE FROM setting WHERE id = p_id;
            END;
            $$;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('setting');
        DB::unprepared('DROP FUNCTION IF EXISTS get_setting(INT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS create_setting(VARCHAR, VARCHAR, VARCHAR, VARCHAR);');
        DB::unprepared('DROP PROCEDURE IF EXISTS update_setting(INT, VARCHAR, VARCHAR, VARCHAR, VARCHAR);');
        DB::unprepared('DROP PROCEDURE IF EXISTS delete_setting(INT);');
    }
};
