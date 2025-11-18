<?php

use App\Models\Delivery;
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
        Schema::create('delivery', function (Blueprint $table) {
            $table->id();
            $table->date('delivery_date');
            $table->decimal('total_cost', 15, 2);
            $table->string('receipt_no')->unique();
            $table->string('receipt_photo');
            $table->enum('status', Delivery::STATUSES)->default('Received');
            $table->text('remarks')->nullable();
            $table->unsignedBigInteger('po_id')->nullable();
            $table->foreign('po_id')->references('id')->on('purchase_order')->onDelete('set null');
        });

        // ==============================
        // FUNCTION: GET delivery
        // ==============================
        DB::unprepared("
            CREATE OR REPLACE FUNCTION get_delivery(p_id INT DEFAULT NULL)
            RETURNS SETOF delivery
            LANGUAGE plpgsql
            AS $$
            BEGIN
                RETURN QUERY
                SELECT * FROM delivery
                WHERE id = COALESCE(p_id, id)
                ORDER BY id;
            END;
            $$;
        ");

        // ==============================
        // PROCEDURE: CREATE
        // ==============================
        DB::unprepared("
            CREATE OR REPLACE PROCEDURE create_delivery(
                p_delivery_date DATE,
                p_total_cost NUMERIC,
                p_receipt_no VARCHAR,
                p_receipt_photo VARCHAR DEFAULT NULL,
                p_status VARCHAR DEFAULT 'PENDING',
                p_remarks TEXT DEFAULT NULL,
                p_po_id BIGINT DEFAULT NULL
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO delivery (delivery_date, total_cost, receipt_no, receipt_photo, status, remarks, po_id, created_at, updated_at)
                VALUES (p_delivery_date, p_total_cost, p_receipt_no, p_receipt_photo, p_status, p_remarks, p_po_id, NOW(), NOW());
            END;
            $$;
        ");

        // ==============================
        // PROCEDURE: UPDATE
        // ==============================
        DB::unprepared("
            CREATE OR REPLACE PROCEDURE update_delivery(
                p_id INT,
                p_delivery_date DATE DEFAULT NULL,
                p_total_cost NUMERIC DEFAULT NULL,
                p_receipt_no VARCHAR DEFAULT NULL,
                p_receipt_photo VARCHAR DEFAULT NULL,
                p_status VARCHAR DEFAULT NULL,
                p_remarks TEXT DEFAULT NULL,
                p_po_id BIGINT DEFAULT NULL
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                UPDATE delivery
                SET
                    delivery_date = COALESCE(p_delivery_date, delivery_date),
                    total_cost = COALESCE(p_total_cost, total_cost),
                    receipt_no = COALESCE(p_receipt_no, receipt_no),
                    receipt_photo = COALESCE(p_receipt_photo, receipt_photo),
                    status = COALESCE(p_status, status),
                    remarks = COALESCE(p_remarks, remarks),
                    po_id = COALESCE(p_po_id, po_id),
                    updated_at = NOW()
                WHERE id = p_id;
            END;
            $$;
        ");

        // ==============================
        // PROCEDURE: DELETE
        // ==============================
        DB::unprepared("
            CREATE OR REPLACE PROCEDURE delete_delivery(p_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                DELETE FROM delivery WHERE id = p_id;
            END;
            $$;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery');

        DB::unprepared('DROP FUNCTION IF EXISTS get_delivery(INT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS create_delivery(DATE, NUMERIC, VARCHAR, VARCHAR, VARCHAR, TEXT, BIGINT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS update_delivery(INT, DATE, NUMERIC, VARCHAR, VARCHAR, VARCHAR, TEXT, BIGINT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS delete_delivery(INT);');
    }
};
