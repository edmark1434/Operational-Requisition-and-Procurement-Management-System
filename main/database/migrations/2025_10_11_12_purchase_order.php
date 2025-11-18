<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\PurchaseOrder;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('purchase_order', function (Blueprint $table) {
            $table->id();
            $table->string('reference_no')->unique();
            $table->timestamp('created_at')->useCurrent();
            $table->decimal('total_cost', 15, 2);
            $table->enum('payment_type', PurchaseOrder::PAYMENT_TYPE);
            $table->enum('status', PurchaseOrder::STATUSES)->default('Pending');
            $table->text('remarks')->nullable();
            $table->unsignedBigInteger('req_id')->nullable();
            $table->unsignedBigInteger('supplier_id')->nullable();
            $table->foreign('req_id')->references('id')->on('requisition')->onDelete('set null');
            $table->foreign('supplier_id')->references('id')->on('supplier')->onDelete('set null');
        });

        // ==============================
        // FUNCTION: GET purchase_order
        // ==============================
        DB::unprepared("
            CREATE OR REPLACE FUNCTION get_purchase_order(p_id INT DEFAULT NULL)
            RETURNS SETOF purchase_order
            LANGUAGE plpgsql
            AS $$
            BEGIN
                RETURN QUERY
                SELECT * FROM purchase_order
                WHERE id = COALESCE(p_id, id)
                ORDER BY id;
            END;
            $$;
        ");

        // ==============================
        // PROCEDURE: CREATE
        // ==============================
        DB::unprepared("
            CREATE OR REPLACE PROCEDURE create_purchase_order(
                p_references_no VARCHAR,
                p_total_cost NUMERIC,
                p_payment_type VARCHAR,
                p_status VARCHAR DEFAULT 'PENDING',
                p_remarks TEXT DEFAULT NULL,
                p_req_id BIGINT DEFAULT NULL,
                p_supplier_id BIGINT DEFAULT NULL
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO purchase_order (references_no, total_cost, payment_type, status, remarks, req_id, supplier_id, created_at)
                VALUES (p_references_no, p_total_cost, p_payment_type, p_status, p_remarks, p_req_id, p_supplier_id, NOW());
            END;
            $$;
        ");

        // ==============================
        // PROCEDURE: UPDATE
        // ==============================
        DB::unprepared("
            CREATE OR REPLACE PROCEDURE update_purchase_order(
                p_id INT,
                p_references_no VARCHAR DEFAULT NULL,
                p_total_cost NUMERIC DEFAULT NULL,
                p_payment_type VARCHAR DEFAULT NULL,
                p_status VARCHAR DEFAULT NULL,
                p_remarks TEXT DEFAULT NULL,
                p_req_id BIGINT DEFAULT NULL,
                p_supplier_id BIGINT DEFAULT NULL
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                UPDATE purchase_order
                SET
                    references_no = COALESCE(p_references_no, references_no),
                    total_cost = COALESCE(p_total_cost, total_cost),
                    payment_type = COALESCE(p_payment_type, payment_type),
                    status = COALESCE(p_status, status),
                    remarks = COALESCE(p_remarks, remarks),
                    req_id = COALESCE(p_req_id, req_id),
                    supplier_id = COALESCE(p_supplier_id, supplier_id)
                WHERE id = p_id;
            END;
            $$;
        ");

        // ==============================
        // PROCEDURE: DELETE
        // ==============================
        DB::unprepared("
            CREATE OR REPLACE PROCEDURE delete_purchase_order(p_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                DELETE FROM purchase_order WHERE id = p_id;
            END;
            $$;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_order');

        DB::unprepared('DROP FUNCTION IF EXISTS get_purchase_order(INT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS create_purchase_order(VARCHAR, NUMERIC, VARCHAR, VARCHAR, TEXT, BIGINT, BIGINT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS update_purchase_order(INT, VARCHAR, NUMERIC, VARCHAR, VARCHAR, TEXT, BIGINT, BIGINT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS delete_purchase_order(INT);');
    }
};
