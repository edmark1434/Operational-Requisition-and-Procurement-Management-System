<?php

use App\Models\Requisition;
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
        Schema::create('requisition', function (Blueprint $table) {
            $table->id();
            $table->dateTime('created_at')->nullable();
            $table->dateTime('updated_at')->nullable();
            $table->enum('status', Requisition::STATUSES)->default('Pending');
            $table->string('remarks')->nullable();
            $table->string('requestor')->nullable();
            $table->string('notes')->nullable();
            $table->string('priority', 15)->default('NORMAL');
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
        });

        DB::unprepared("
            CREATE OR REPLACE FUNCTION get_requisition(
                p_id INT DEFAULT NULL,
                p_user_id INT DEFAULT NULL,
                p_status VARCHAR DEFAULT NULL
            )
            RETURNS SETOF requisition AS $$
            BEGIN
                RETURN QUERY
                SELECT * FROM requisition
                WHERE
                    id = COALESCE(p_id, id) AND
                    user_id = COALESCE(p_user_id, user_id) AND
                    status = COALESCE(p_status, status)
                ORDER BY created_at DESC;
            END;
            $$ LANGUAGE plpgsql;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE create_requisition(
                p_status VARCHAR,
                p_remarks VARCHAR,
                p_requestor VARCHAR,
                p_notes VARCHAR,
                p_user_id INT
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO requisition (created_at, updated_at, status, remarks, requestor, notes, user_id)
                VALUES (NOW(), NOW(), p_status, p_remarks, p_requestor, p_notes, p_user_id);
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE update_requisition(
                p_id INT,
                p_status VARCHAR DEFAULT NULL,
                p_remarks VARCHAR DEFAULT NULL,
                p_requestor VARCHAR DEFAULT NULL,
                p_notes VARCHAR DEFAULT NULL
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                UPDATE requisition
                SET
                    updated_at = NOW(),
                    status = COALESCE(p_status, status),
                    remarks = COALESCE(p_remarks, remarks),
                    requestor = COALESCE(p_requestor, requestor),
                    notes = COALESCE(p_notes, notes)
                WHERE id = p_id;
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE delete_requisition(p_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                DELETE FROM requisition WHERE id = p_id;
            END;
            $$;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requisition');
        DB::unprepared("DROP FUNCTION IF EXISTS get_requisition(INT, INT, VARCHAR);");
        DB::unprepared("DROP PROCEDURE IF EXISTS create_requisition(VARCHAR, VARCHAR, VARCHAR, VARCHAR, INT);");
        DB::unprepared("DROP PROCEDURE IF EXISTS update_requisition(INT, VARCHAR, VARCHAR, VARCHAR, VARCHAR);");
        DB::unprepared("DROP PROCEDURE IF EXISTS delete_requisition(INT);");
    }
};
