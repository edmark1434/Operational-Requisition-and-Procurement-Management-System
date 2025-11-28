<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            // Item Categories
            [
                'name' => 'Electrical',
                'description' => 'Electrical items and supplies',
                'type' => 'Items',
            ],
            [
                'name' => 'Consumables',
                'description' => 'Consumable materials and supplies',
                'type' => 'Items',
            ],
            [
                'name' => 'Tools',
                'description' => 'Various tools and related items',
                'type' => 'Items',
            ],
            [
                'name' => 'Parts',
                'description' => 'Mechanical and replacement parts',
                'type' => 'Items',
            ],
            [
                'name' => 'Equipment',
                'description' => 'General equipment items',
                'type' => 'Items',
            ],
            [
                'name' => 'Office Supplies',
                'description' => 'Supplies used for office operations',
                'type' => 'Items',
            ],

            // Service Categories
            [
                'name' => 'IT Services',
                'description' => 'Technical and IT-related services',
                'type' => 'Services',
            ],
            [
                'name' => 'Equipment Services',
                'description' => 'Equipment-related services',
                'type' => 'Services',
            ],
            [
                'name' => 'Facilities and Maintenance',
                'description' => 'Building and maintenance services',
                'type' => 'Services',
            ],
            [
                'name' => 'Operations and Logistics',
                'description' => 'Operational and logistics support services',
                'type' => 'Services',
            ],
        ];

        foreach ($categories as $cat) {
            Category::create($cat);
        }
    }
}
