<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            MakeSeeder::class,
            CategorySeeder::class,
            VendorSeeder::class,
            ItemSeeder::class,
            ServiceSeeder::class,
            VendorContactSeeder::class,
            UserPermissionSeeder::class,
        ]);
        User::factory(5)->create();
    }
}
