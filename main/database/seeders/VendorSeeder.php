<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VendorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $vendors = [
            [
                'name' => 'ElectroMax Supplies',
                'email' => 'electromax@example.com',
                'contact_number' => '09171234567',
                'allows_cash' => true,
                'allows_disbursement' => true,
                'allows_store_credit' => false,
                'is_active' => true,
                'categories' => ['Electrical', 'Equipment'],
            ],
            [
                'name' => 'OfficePro Solutions',
                'email' => 'officepro@example.com',
                'contact_number' => null,
                'allows_cash' => true,
                'allows_disbursement' => false,
                'allows_store_credit' => true,
                'is_active' => true,
                'categories' => ['Office Supplies', 'Consumables'],
            ],
            [
                'name' => 'TechServ IT',
                'email' => 'techserv@example.com',
                'contact_number' => '09281234567',
                'allows_cash' => false,
                'allows_disbursement' => true,
                'allows_store_credit' => true,
                'is_active' => true,
                'categories' => ['IT Services'],
            ],
            [
                'name' => 'ToolKing',
                'email' => 'toolking@example.com',
                'contact_number' => '09351234567',
                'allows_cash' => true,
                'allows_disbursement' => false,
                'allows_store_credit' => false,
                'is_active' => true,
                'categories' => ['Tools', 'Parts'],
            ],
            [
                'name' => 'EquipPro',
                'email' => 'equippro@example.com',
                'contact_number' => '09451234567',
                'allows_cash' => false,
                'allows_disbursement' => true,
                'allows_store_credit' => false,
                'is_active' => true,
                'categories' => ['Equipment Services', 'Equipment'],
            ],
            [
                'name' => 'Facility Masters',
                'email' => 'facility@example.com',
                'contact_number' => '09181234567',
                'allows_cash' => true,
                'allows_disbursement' => true,
                'allows_store_credit' => true,
                'is_active' => true,
                'categories' => ['Facilities and Maintenance'],
            ],
            [
                'name' => 'OpsLogix',
                'email' => 'opslogix@example.com',
                'contact_number' => null,
                'allows_cash' => false,
                'allows_disbursement' => true,
                'allows_store_credit' => true,
                'is_active' => true,
                'categories' => ['Operations and Logistics'],
            ],
            [
                'name' => 'Partify',
                'email' => 'partify@example.com',
                'contact_number' => '09271234567',
                'allows_cash' => true,
                'allows_disbursement' => false,
                'allows_store_credit' => false,
                'is_active' => true,
                'categories' => ['Parts', 'Tools'],
            ],
        ];

        foreach ($vendors as $vendor) {
            $vendorId = DB::table('vendor')->insertGetId([
                'name' => $vendor['name'],
                'email' => $vendor['email'],
                'contact_number' => $vendor['contact_number'],
                'allows_cash' => $vendor['allows_cash'],
                'allows_disbursement' => $vendor['allows_disbursement'],
                'allows_store_credit' => $vendor['allows_store_credit'],
                'is_active' => $vendor['is_active'],
            ]);

            // Attach vendor to categories by name
            foreach ($vendor['categories'] as $categoryName) {
                $categoryId = DB::table('category')->where('name', $categoryName)->value('id');
                if ($categoryId) {
                    DB::table('category_vendor')->insert([
                        'vendor_id' => $vendorId,
                        'category_id' => $categoryId,
                    ]);
                }
            }
        }
    }
}
