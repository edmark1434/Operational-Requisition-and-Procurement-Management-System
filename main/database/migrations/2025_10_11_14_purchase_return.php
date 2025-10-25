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
        Schema::create('purchase_return', function (Blueprint $table) {
            $table->id();
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->date('return_date')->nullable();
            $table->enum('status', ['PENDING', 'REJECTED', 'DELIVERED', 'RECEIVED']);
            $table->text('remarks')->nullable();
            $table->foreignId('purchase_id')->constrained('purchase')->cascadeOnDelete();
        });

        DB::unprepared("
            CREATE OR REPLACE FUNCTION get_purchase_return(p_id INT DEFAULT NULL)
            RETURNS SETOF purchase_return
            LANGUAGE plpgsql
            AS $$
            BEGIN
                RETURN QUERY
                SELECT * FROM purchase_return
                WHERE id = COALESCE(p_id, id)
                ORDER BY id;
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE create_purchase_return(
                p_return_date DATE,
                p_status TEXT,
                p_remarks TEXT,
                p_purchase_id INT
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO purchase_return (return_date, status, remarks, purchase_id)
                VALUES (p_return_date, p_status, p_remarks, p_purchase_id);
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE update_purchase_return(
                p_id INT,
                p_return_date DATE DEFAULT NULL,
                p_status TEXT DEFAULT NULL,
                p_remarks TEXT DEFAULT NULL,
                p_purchase_id INT DEFAULT NULL
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
                UPDATE purchase_return
                SET
                    return_date = COALESCE(p_return_date, return_date),
                    status      = COALESCE(p_status, status),
                    remarks     = COALESCE(p_remarks, remarks),
                    purchase_id = COALESCE(p_purchase_id, purchase_id)
                WHERE id = p_id;
            END;
            $$;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE delete_purchase_return(p_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                DELETE FROM purchase_return WHERE id = p_id;
            END;
            $$;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_return');

        DB::unprepared('DROP FUNCTION IF EXISTS get_purchase_return(INT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS create_purchase_return(DATE, TEXT, TEXT, INT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS update_purchase_return(INT, DATE, TEXT, TEXT, INT);');
        DB::unprepared('DROP PROCEDURE IF EXISTS delete_purchase_return(INT);');
    }
};
