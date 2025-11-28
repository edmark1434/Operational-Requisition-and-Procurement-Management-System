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
        Schema::create('role_permission', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained('role')->cascadeOnDelete();
            $table->foreignId('perm_id')->constrained('permission')->cascadeOnDelete();
        });
       DB::unprepared("
            CREATE OR REPLACE PROCEDURE seed_role_permission()
            LANGUAGE plpgsql
            AS $$
            BEGIN
                INSERT INTO role_permission (role_id, perm_id)
                VALUES

                (1,1),
                (1,6),(1,7),(1,8),
                (1,10),(1,11),(1,12),
                (1,13),(1,14),(1,16),

                (2,1),(2,3),(2,4),
                (2,6),(2,8),(2,9),
                (2,10),
                (2,13),(2,15),
                (2,17),(2,18),
                (2,23),(2,24),

                (3,1),
                (3,6),
                (3,10),
                (3,13),
                (3,17),(3,18),
                (3,19),(3,20),
                (3,21),(3,22),
                (3,23),(3,24),
                (3,25),(3,26),(3,27),(3,28),(3,29),
                (3,30),(3,31),
                (3,32),(3,33),
                
                (4,2),(4,5);
            END;
            $$;
        ");

        DB::unprepared("CALL seed_role_permission();");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_permission');
        DB::unprepared("DROP PROCEDURE IF EXISTS seed_role_permission();");
    }
};
