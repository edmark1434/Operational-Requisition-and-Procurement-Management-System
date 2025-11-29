<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Item;
use App\Models\Category;
use App\Models\Make;
use Illuminate\Support\Facades\DB;

class ItemSeeder extends Seeder
{
    public function run()
    {
        $items = [
            // Truck Parts (Maintenance / Repair)
            ['name' => 'Isuzu NPR Brake Pad Set', 'unit_price' => 4500, 'current_stock' => 15, 'category' => 'Parts', 'make' => 'Isuzu', 'dimensions' => '20x15x5 cm'],
            ['name' => 'Isuzu Crosswind Fuel Filter', 'unit_price' => 1200, 'current_stock' => 30, 'category' => 'Parts', 'make' => 'Isuzu', 'dimensions' => '15x10x10 cm'],
            ['name' => 'Mitsubishi Fuso Clutch Disc', 'unit_price' => 7500, 'current_stock' => 10, 'category' => 'Parts', 'make' => 'Fuso', 'dimensions' => '30x30x3 cm'],
            ['name' => 'Hino 300 Series Radiator Hose', 'unit_price' => 950, 'current_stock' => 25, 'category' => 'Parts', 'make' => 'Hino', 'dimensions' => null],
            ['name' => 'Toyota HiAce Alternator Assembly', 'unit_price' => 6800, 'current_stock' => 8, 'category' => 'Parts', 'make' => 'Toyota', 'dimensions' => '25x20x20 cm'],
            ['name' => 'Nissan Urvan Air Conditioning Compressor', 'unit_price' => 10200, 'current_stock' => 5, 'category' => 'Parts', 'make' => 'Nissan', 'dimensions' => '30x25x25 cm'],
            ['name' => 'Hyundai HD65 Timing Belt', 'unit_price' => 2300, 'current_stock' => 20, 'category' => 'Parts', 'make' => 'Hyundai', 'dimensions' => null],
            ['name' => 'Isuzu Forward Oil Seal Kit', 'unit_price' => 1500, 'current_stock' => 18, 'category' => 'Parts', 'make' => 'Isuzu', 'dimensions' => null],
            ['name' => 'Mitsubishi Canter Shock Absorber (Front)', 'unit_price' => 4200, 'current_stock' => 12, 'category' => 'Parts', 'make' => 'Fuso', 'dimensions' => '90x10 cm'],
            ['name' => 'Hino 500 Series Power Steering Pump', 'unit_price' => 8500, 'current_stock' => 6, 'category' => 'Parts', 'make' => 'Hino', 'dimensions' => '25x20x15 cm'],

            // Engine & Drivetrain
            ['name' => 'Shell Rimula R4 Engine Oil (1L)', 'unit_price' => 500, 'current_stock' => 50, 'category' => 'Consumables', 'make' => 'Shell', 'dimensions' => null],
            ['name' => 'Caltex Delo Gear Oil (1L)', 'unit_price' => 450, 'current_stock' => 45, 'category' => 'Consumables', 'make' => 'Chevron', 'dimensions' => null],
            ['name' => 'Motolite Truck Battery N100', 'unit_price' => 7500, 'current_stock' => 10, 'category' => 'Equipment', 'make' => 'Motolite', 'dimensions' => '35x18x20 cm'],
            ['name' => 'Bosch Wiper Blade 20in', 'unit_price' => 1200, 'current_stock' => 35, 'category' => 'Tools', 'make' => 'Bosch', 'dimensions' => null],

            // Electrical & Lighting
            ['name' => 'Stanley LED Headlamp Assembly', 'unit_price' => 1800, 'current_stock' => 25, 'category' => 'Electrical', 'make' => 'Stanley', 'dimensions' => '15x10x10 cm'],
            ['name' => 'Osram 12V Signal Light Bulb', 'unit_price' => 350, 'current_stock' => 100, 'category' => 'Electrical', 'make' => 'Osram', 'dimensions' => null],

            // Consumables / Tools
            ['name' => '3M Industrial Grease Tube', 'unit_price' => 400, 'current_stock' => 60, 'category' => 'Consumables', 'make' => '3M', 'dimensions' => null],
            ['name' => 'WD-40 Multi-Purpose Spray (330ml)', 'unit_price' => 250, 'current_stock' => 80, 'category' => 'Consumables', 'make' => 'WD-40', 'dimensions' => null],
            ['name' => 'NGK Spark Plug (Standard)', 'unit_price' => 180, 'current_stock' => 120, 'category' => 'Parts', 'make' => 'NGK', 'dimensions' => null],
            ['name' => 'Goodyear 16” Truck Tire', 'unit_price' => 9500, 'current_stock' => 15, 'category' => 'Parts', 'make' => 'Goodyear', 'dimensions' => '160x40 cm'],
        ];

        foreach ($items as $data) {
            $category = Category::where('name', $data['category'])->first();
            $make = Make::where('name', $data['make'])->first();

            // Pick a vendor that supplies this category, or just take the first one
            $vendor = DB::table('category_vendor')
                ->where('category_id', $category->id)
                ->join('vendor', 'vendor.id', '=', 'category_vendor.vendor_id')
                ->where('vendor.is_active', true)
                ->inRandomOrder()
                ->first();

            // generate a random 12-digit barcode
            $barcode = mt_rand(100000000000, 999999999999);

            Item::create([
                'barcode' => $barcode,
                'name' => $data['name'],
                'dimensions' => $data['dimensions'], // null if not needed
                'unit_price' => $data['unit_price'],
                'current_stock' => $data['current_stock'],
                'is_active' => true,
                'category_id' => $category->id,
                'make_id' => $make ? $make->id : null,
                'vendor_id' => $vendor?->id,
            ]);
        }
    }
}
