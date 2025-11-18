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
        Schema::create('audit_log_type', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique();
        });

        DB::unprepared("
            CREATE OR REPLACE FUNCTION get_audit_log_type(p_id INT DEFAULT NULL)
            RETURNS SETOF audit_log_type AS $$
            BEGIN
                RETURN QUERY
                SELECT * FROM audit_log_type
                WHERE id = COALESCE(p_id, id)
                ORDER BY id;
            END;
            $$ LANGUAGE plpgsql;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE seed_audit_log_type()
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO audit_log_type (name)
                VALUES
                ('Requisition Approved'),
                ('Requisition Rejected'),
                ('Requisition Changed'),
                ('Purchase Order Merged'),
                ('Purchase Order Updated'),
                ('Purchase Order Issued'),
                ('Purchase Order Rejected'),
                ('Delivery Updated'),
                ('Return Created'),
                ('Return Issued'),
                ('Return Rejected'),
                ('Requisition Received'),
                ('Item Created'),
                ('Item Updated'),
                ('Item Removed'),
                ('Make Created'),
                ('Make Updated'),
                ('Make Removed'),
                ('Category Created'),
                ('Category Updated'),
                ('Category Removed'),
                ('Supplier Created'),
                ('Supplier Updated'),
                ('Supplier Removed'),
                ('User Created'),
                ('User Permissions Updated'),
                ('User Password Updated'),
                ('User Removed'),
                ('Role Created'),
                ('Role Updated'),
                ('Role Removed'),
                ('Setting Updated');
            END;
            $$;
        ");

        DB::unprepared("CALL seed_audit_log_type();");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_log_type');
        DB::unprepared("DROP FUNCTION IF EXISTS get_audit_log_type(INT);");
        DB::unprepared("DROP PROCEDURE IF EXISTS seed_audit_log_type();");
    }
};
