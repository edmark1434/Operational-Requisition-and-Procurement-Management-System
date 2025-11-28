<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\RolePermission;
use App\Models\User;
use App\Models\UserPermission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // DEMO USERS
        $roles = [1, 2, 3]; // role IDs for the first 3 users

        // Assign fixed roles to the first 3 users
        foreach ($roles as $index => $roleId) {
            $user = User::find($index + 1); // users with id 1, 2, 3
            if (!$user) continue;

            $permIds = RolePermission::where('role_id', $roleId)->pluck('perm_id');

            foreach ($permIds as $permId) {
                UserPermission::firstOrCreate([
                    'user_id' => $user->id,
                    'perm_id' => $permId,
                ]);
            }
        }

        // FACTORY
        $roles = Role::all(); // get all roles

        // Loop through all users except the first 3
        foreach (User::where('id', '>', 3)->get() as $user) {

            // Pick a random role
            $role = $roles->random();

            // Get all permission IDs for that role
            $permIds = RolePermission::where('role_id', $role->id)->pluck('perm_id');

            foreach ($permIds as $permId) {
                // Insert into user_permission
                UserPermission::firstOrCreate([
                    'user_id' => $user->id,
                    'perm_id' => $permId,
                ]);
            }
        }
    }
}