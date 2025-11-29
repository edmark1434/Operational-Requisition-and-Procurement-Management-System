<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VendorContactSeeder extends Seeder
{
    public function run(): void
    {
        // Fetch all vendors
        $vendors = DB::table('vendor')->get();

        // Define some example contacts for vendors
        $contactsData = [
            'ElectroMax Supplies' => [
                ['name' => 'Alice Santos', 'position' => 'Sales Manager', 'email' => 'alice@electromax.com', 'contact_number' => '09170000001'],
                ['name' => 'Bob Reyes', 'position' => 'Support Lead', 'email' => 'bob@electromax.com', 'contact_number' => '09170000002'],
            ],
            'OfficePro Solutions' => [
                ['name' => 'Carla Lim', 'position' => 'Account Manager', 'email' => 'carla@officepro.com', 'contact_number' => '09280000001'],
            ],
            'TechServ IT' => [
                ['name' => 'Daniel Tan', 'position' => 'IT Specialist', 'email' => 'daniel@techserv.com', 'contact_number' => '09380000001'],
                ['name' => 'Eve Cruz', 'position' => 'Support Engineer', 'email' => 'eve@techserv.com', 'contact_number' => '09380000002'],
            ],
            'ToolKing' => [
                ['name' => 'Frank Yu', 'position' => 'Sales Lead', 'email' => 'frank@toolking.com', 'contact_number' => '09480000001'],
            ],
            'EquipPro' => [
                ['name' => 'Grace Lim', 'position' => 'Operations Manager', 'email' => 'grace@equippro.com', 'contact_number' => '09580000001'],
            ],
            'Facility Masters' => [
                ['name' => 'Henry Ong', 'position' => 'Facility Coordinator', 'email' => 'henry@facility.com', 'contact_number' => '09680000001'],
            ],
            'OpsLogix' => [
                ['name' => 'Ivy Santos', 'position' => 'Logistics Manager', 'email' => 'ivy@opslogix.com', 'contact_number' => '09780000001'],
            ],
            'Partify' => [
                ['name' => 'Jack Tan', 'position' => 'Parts Specialist', 'email' => 'jack@partify.com', 'contact_number' => '09880000001'],
            ],
        ];

        foreach ($vendors as $vendor) {
            $vendorName = $vendor->name;
            if (isset($contactsData[$vendorName])) {
                foreach ($contactsData[$vendorName] as $contact) {
                    DB::table('vendor_contacts')->insert([
                        'vendor_id' => $vendor->id,
                        'name' => $contact['name'],
                        'position' => $contact['position'],
                        'email' => $contact['email'],
                        'contact_number' => $contact['contact_number'],
                        'is_active' => true,
                    ]);
                }
            }
        }
    }
}
