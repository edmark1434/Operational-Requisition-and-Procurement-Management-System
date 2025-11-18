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
        Schema::create('notification', function (Blueprint $table) {
            $table->id();
            $table->string('message', 255);
            $table->boolean('is_read')->default(false);
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
        });
        DB::unprepared("
            CREATE OR REPLACE FUNCTION get_notification(p_id INT DEFAULT NULL)
            RETURNS SETOF notification
            LANGUAGE plpgsql
            AS $$
            BEGIN
                RETURN QUERY
                SELECT * FROM notification
                WHERE id = COALESCE(p_id, id)
                ORDER BY created_at DESC;
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE create_notification(
                p_message TEXT,
                p_is_read BOOLEAN DEFAULT FALSE,
                p_user_id INT DEFAULT NULL
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO notification (message, is_read, user_id)
                VALUES (p_message, p_is_read, p_user_id);
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE update_notification(
                p_id INT,
                p_message TEXT DEFAULT NULL,
                p_is_read BOOLEAN DEFAULT NULL,
                p_user_id INT DEFAULT NULL
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                UPDATE notification
                SET
                    message = COALESCE(p_message, message),
                    is_read = COALESCE(p_is_read, is_read),
                    user_id = COALESCE(p_user_id, user_id)
                WHERE id = p_id;
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE delete_notification(p_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                DELETE FROM notification WHERE id = p_id;
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE mark_notification_as_read(p_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                UPDATE notification
                SET is_read = TRUE
                WHERE id = p_id;
            END;
            $$;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification');
        DB::unprepared('DROP FUNCTION IF EXISTS get_notification(INT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS create_notification(TEXT, BOOLEAN, INT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS update_notification(INT, TEXT, BOOLEAN, INT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS delete_notification(INT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS mark_notification_as_read(INT);');
    }
};
