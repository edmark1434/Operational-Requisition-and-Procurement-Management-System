<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Seeder;

class UserPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
   public function run()
    {
        DB::table('user_permission')->insert([
            // User 1
            ['user_id' => 1, 'perm_id' => 1],
            ['user_id' => 1, 'perm_id' => 6],
            ['user_id' => 1, 'perm_id' => 7],
            ['user_id' => 1, 'perm_id' => 8],
            ['user_id' => 1, 'perm_id' => 10],
            ['user_id' => 1, 'perm_id' => 11],
            ['user_id' => 1, 'perm_id' => 12],
            ['user_id' => 1, 'perm_id' => 13],
            ['user_id' => 1, 'perm_id' => 14],
            ['user_id' => 1, 'perm_id' => 16],

            // User 2
            ['user_id' => 2, 'perm_id' => 1],
            ['user_id' => 2, 'perm_id' => 3],
            ['user_id' => 2, 'perm_id' => 4],
            ['user_id' => 2, 'perm_id' => 6],
            ['user_id' => 2, 'perm_id' => 8],
            ['user_id' => 2, 'perm_id' => 9],
            ['user_id' => 2, 'perm_id' => 10],
            ['user_id' => 2, 'perm_id' => 13],
            ['user_id' => 2, 'perm_id' => 15],
            ['user_id' => 2, 'perm_id' => 17],
            ['user_id' => 2, 'perm_id' => 18],
            ['user_id' => 2, 'perm_id' => 23],
            ['user_id' => 2, 'perm_id' => 24],

            // User 3
            ['user_id' => 3, 'perm_id' => 1],
            ['user_id' => 3, 'perm_id' => 6],
            ['user_id' => 3, 'perm_id' => 10],
            ['user_id' => 3, 'perm_id' => 13],
            ['user_id' => 3, 'perm_id' => 17],
            ['user_id' => 3, 'perm_id' => 18],
            ['user_id' => 3, 'perm_id' => 19],
            ['user_id' => 3, 'perm_id' => 20],
            ['user_id' => 3, 'perm_id' => 21],
            ['user_id' => 3, 'perm_id' => 22],
            ['user_id' => 3, 'perm_id' => 23],
            ['user_id' => 3, 'perm_id' => 24],
            ['user_id' => 3, 'perm_id' => 25],
            ['user_id' => 3, 'perm_id' => 26],
            ['user_id' => 3, 'perm_id' => 27],
            ['user_id' => 3, 'perm_id' => 28],
            ['user_id' => 3, 'perm_id' => 29],
            ['user_id' => 3, 'perm_id' => 30],
            ['user_id' => 3, 'perm_id' => 31],
            ['user_id' => 3, 'perm_id' => 32],
            ['user_id' => 3, 'perm_id' => 33],

            // User 4
            ['user_id' => 4, 'perm_id' => 2],
            ['user_id' => 4, 'perm_id' => 5],
        ]);
    }
}