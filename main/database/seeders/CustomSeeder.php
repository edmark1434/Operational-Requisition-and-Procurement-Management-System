<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Permission;
use App\Models\Role;
use Faker\Factory as Faker;

class CustomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    protected $faker;
    public function run(): void
    {
        $this->faker = Faker::create();

        $permission = [
            ['name' => 'Items'],
            ['name' => 'Categories and Makes'],
            ['name' => 'Users'],
            ['name' => 'Permission and Roles'],
            ['name' => 'Settings'],
            ['name' => 'Requisitions'],
            ['name' => 'Purchase Orders'],
            ['name' => 'Deliveries'],
            ['name' => 'Returns'],
            ['name' => 'Suppliers'],
            ['name' => 'Dashboard Statistics'],
            ['name' => 'Audit Logs'],
            ['name' => 'Notifications'],
        ];
        $roles = [
            ['name' => 'Manager'],
            ['name' => 'Encoder'],
            ['name' => 'Administrator']
        ];
        foreach($permission as $perm){
            Permission::create($perm);
        }
        foreach($roles as $role){
            Role::create([
                ...$role,
                'description' => $this->faker->text()
            ]);
        }
    }
}
