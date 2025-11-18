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
        Schema::create('permission', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique();
            $table->string('category');
        });

        DB::unprepared("
            CREATE OR REPLACE FUNCTION get_permission(p_id INT DEFAULT NULL)
            RETURNS SETOF permission AS $$
            BEGIN
                RETURN QUERY
                SELECT * FROM permission
                WHERE id = COALESCE(p_id, id)
                ORDER BY id;
            END;
            $$ LANGUAGE plpgsql;
        ");

        DB::unprepared("
            CREATE OR REPLACE PROCEDURE seed_permission()
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO permission (name, category)
                VALUES

                ('View Requisitions', 'Requisitions'),
                ('Create Requisition', 'Requisitions'),
                ('Approve / Reject Requisition', 'Requisitions'),
                ('Mark Requisition for Pickup', 'Requisitions'),
                ('Receive Requisition', 'Requisitions'),

                ('View Purchase Orders', 'Purchase Orders'),
                ('Merge Purchase Orders', 'Purchase Orders'),
                ('Update Purchase Order', 'Purchase Orders'),
                ('Issue Purchase Order', 'Purchase Orders'),

                ('View Deliveries', 'Deliveries'),
                ('Add Delivery', 'Deliveries'),
                ('Update Delivery', 'Deliveries'),

                ('View Returns', 'Returns'),
                ('Create Return', 'Returns'),
                ('Issue Return', 'Returns'),
                ('Mark Return as Replaced / Rejected', 'Returns'),

                ('View Items', 'Items'),
                ('Manage Items', 'Items'),

                ('View Makes', 'Makes'),
                ('Manage Makes', 'Makes'),

                ('View Categories', 'Categories'),
                ('Manage Categories', 'Categories'),

                ('View Suppliers', 'Suppliers'),
                ('Manage Suppliers', 'Suppliers'),

                ('View Users', 'Users'),
                ('Create User', 'Users'),
                ('Update User Permissions', 'Users'),
                ('Update User Password', 'Users'),
                ('Remove User', 'Users'),

                ('View Roles and Permissions', 'Roles and Permissions'),
                ('Manage Roles', 'Roles and Permissions'),

                ('View Settings', 'Settings'),
                ('Update Settings', 'Settings');
            END;
            $$;
        ");

        DB::unprepared("CALL seed_permission();");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permission');
        DB::unprepared("DROP FUNCTION IF EXISTS get_permission(INT);");
        DB::unprepared("DROP PROCEDURE IF EXISTS seed_permission();");
    }
};
