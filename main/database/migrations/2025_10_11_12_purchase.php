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
        Schema::create('purchase', function (Blueprint $table) {
            $table->id();
            $table->date('purchase_date');
            $table->decimal('total_cost', 10, 2);
            $table->integer('receipt_no')->nullable();
            $table->string('receipt_photo', 255)->nullable();
            $table->enum('payment_type', ['CASH', 'STORE_CREDIT', 'DISBURSEMENT'])->nullable();
            $table->foreignId('req_id')->nullable()->constrained('requisition')->nullOnDelete();
            $table->foreignId('supplier_id')->constrained('supplier')->cascadeOnDelete();
        });
        DB::unprepared("
            CREATE OR REPLACE FUNCTION get_purchase(p_id INT DEFAULT NULL)
            RETURNS SETOF purchase
            LANGUAGE plpgsql
            AS $$
            BEGIN
                RETURN QUERY
                SELECT * FROM purchase
                WHERE id = COALESCE(p_id, id)
                ORDER BY purchase_date DESC;
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE create_purchase(
                p_purchase_date DATE,
                p_total_cost DECIMAL,
                p_receipt_no INT DEFAULT NULL,
                p_receipt_photo VARCHAR(255) DEFAULT NULL,
                p_payment_type VARCHAR(50) DEFAULT NULL,
                p_req_id INT DEFAULT NULL,
                p_supplier_id INT DEFAULT NULL
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO purchase (
                    purchase_date, total_cost, receipt_no, receipt_photo,
                    payment_type, req_id, supplier_id
                )
                VALUES (
                    p_purchase_date, p_total_cost, p_receipt_no, p_receipt_photo,
                    p_payment_type, p_req_id, p_supplier_id
                );
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE update_purchase(
                p_id INT,
                p_purchase_date DATE DEFAULT NULL,
                p_total_cost DECIMAL DEFAULT NULL,
                p_receipt_no INT DEFAULT NULL,
                p_receipt_photo VARCHAR(255) DEFAULT NULL,
                p_payment_type VARCHAR(50) DEFAULT NULL,
                p_req_id INT DEFAULT NULL,
                p_supplier_id INT DEFAULT NULL
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                UPDATE purchase
                SET
                    purchase_date = COALESCE(p_purchase_date, purchase_date),
                    total_cost = COALESCE(p_total_cost, total_cost),
                    receipt_no = COALESCE(p_receipt_no, receipt_no),
                    receipt_photo = COALESCE(p_receipt_photo, receipt_photo),
                    payment_type = COALESCE(p_payment_type, payment_type),
                    req_id = COALESCE(p_req_id, req_id),
                    supplier_id = COALESCE(p_supplier_id, supplier_id)
                WHERE id = p_id;
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE delete_purchase(p_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                DELETE FROM purchase WHERE id = p_id;
            END;
            $$;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase');
        DB::unprepared('DROP FUNCTION IF EXISTS get_purchase(INT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS create_purchase(DATE,DECIMAL,INT,VARCHAR,VARCHAR,INT,INT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS update_purchase(INT,DATE,DECIMAL,INT,VARCHAR,VARCHAR,INT,INT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS delete_purchase(INT);');
    }
};
