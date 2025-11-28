<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Service;
use Illuminate\Support\Facades\DB;

class ServiceSeeder extends Seeder
{
    public function run()
    {
        // Map category_id to vendors (assumes you have seeded vendors with these names)
        $categoryVendors = [
            7 => 'TechServ IT', // IT Services
            8 => 'EquipPro',    // Equipment Services
            9 => 'Facility Masters', // Facilities & Maintenance
            10 => 'OpsLogix',   // Operations & Logistics
        ];

        $services = [
            [
                'name' => 'Network Installation',
                'description' => 'Network cabling and setup',
                'hourly_rate' => 80.00,
                'category_id' => 7,
            ],
            [
                'name' => 'IT Support',
                'description' => 'Technical support and IT services',
                'hourly_rate' => 75.00,
                'category_id' => 7,
            ],
            [
                'name' => 'Equipment Repair',
                'description' => 'Repair and maintenance for equipment',
                'hourly_rate' => 120.00,
                'category_id' => 8,
            ],
            [
                'name' => 'Equipment Calibration',
                'description' => 'Precision equipment calibration services',
                'hourly_rate' => 90.00,
                'category_id' => 8,
            ],
            [
                'name' => 'Electrical Installation',
                'description' => 'Electrical wiring and installation services',
                'hourly_rate' => 85.00,
                'category_id' => 9,
            ],
            [
                'name' => 'Plumbing Services',
                'description' => 'Pipe installation and plumbing repairs',
                'hourly_rate' => 70.00,
                'category_id' => 9,
            ],
            [
                'name' => 'Cleaning Services',
                'description' => 'Office and facility cleaning',
                'hourly_rate' => 45.00,
                'category_id' => 9,
            ],
            [
                'name' => 'Catering Services',
                'description' => 'Food and beverage catering',
                'hourly_rate' => 60.00,
                'category_id' => 10,
            ],
        ];

        foreach ($services as $service) {
            // Find the vendor ID for this service's category
            $vendorName = $categoryVendors[$service['category_id']] ?? null;
            $vendor = $vendorName ? DB::table('vendor')->where('name', $vendorName)->first() : null;

            Service::create([
                'name' => $service['name'],
                'description' => $service['description'],
                'hourly_rate' => $service['hourly_rate'],
                'category_id' => $service['category_id'],
                'vendor_id' => $vendor?->id,
                'is_active' => true,
            ]);
        }
    }
}
