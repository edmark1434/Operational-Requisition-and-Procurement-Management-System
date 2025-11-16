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
        Schema::create('returns', function (Blueprint $table) {
            $table->id();
            $table->timestamp('created_at')->useCurrent();
            $table->date('return_date');
            $table->string('status')->default('PENDING');
            $table->text('remarks')->nullable();
            $table->unsignedBigInteger('delivery_id')->nullable();
            $table->foreign('delivery_id')->references('id')->on('delivery')->onDelete('set null');
        });

        // ==============================
        // FUNCTION: GET returns
        // ==============================
        DB::unprepared("
            CREATE OR REPLACE FUNCTION get_returns(p_id INT DEFAULT NULL)
            RETURNS SETOF returns
            LANGUAGE plpgsql
            AS $$
            BEGIN
                RETURN QUERY
                SELECT * FROM returns
                WHERE id = COALESCE(p_id, id)
                ORDER BY id;
            END;
            $$;
        ");

        // ==============================
        // PROCEDURE: CREATE
        // ==============================
        DB::unprepared("
            CREATE OR REPLACE PROCEDURE create_returns(
                p_return_date DATE,
                p_status VARCHAR DEFAULT 'PENDING',
                p_remarks TEXT DEFAULT NULL,
                p_delivery_id BIGINT DEFAULT NULL
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO returns (return_date, status, remarks, delivery_id, created_at)
                VALUES (p_return_date, p_status, p_remarks, p_delivery_id, NOW());
            END;
            $$;
        ");

        // ==============================
        // PROCEDURE: UPDATE
        // ==============================
        DB::unprepared("
            CREATE OR REPLACE PROCEDURE update_returns(
                p_id INT,
                p_return_date DATE DEFAULT NULL,
                p_status VARCHAR DEFAULT NULL,
                p_remarks TEXT DEFAULT NULL,
                p_delivery_id BIGINT DEFAULT NULL
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                UPDATE returns
                SET
                    return_date = COALESCE(p_return_date, return_date),
                    status = COALESCE(p_status, status),
                    remarks = COALESCE(p_remarks, remarks),
                    delivery_id = COALESCE(p_delivery_id, delivery_id)
                WHERE id = p_id;
            END;
            $$;
        ");

        // ==============================
        // PROCEDURE: DELETE
        // ==============================
        DB::unprepared("
            CREATE OR REPLACE PROCEDURE delete_returns(p_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                DELETE FROM returns WHERE id = p_id;
            END;
            $$;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('returns');

        DB::unprepared('DROP FUNCTION IF EXISTS get_returns(INT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS create_returns(DATE, VARCHAR, TEXT, BIGINT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS update_returns(INT, DATE, VARCHAR, TEXT, BIGINT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS delete_returns(INT);');
    }
};
