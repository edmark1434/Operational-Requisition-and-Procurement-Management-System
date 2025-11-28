<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Make;

class MakeSeeder extends Seeder
{
    public function run()
    {
        $makes = [
            // Tools & Maintenance
            'Bosch',
            'Makita',
            'DeWalt',
            'Stanley',
            'Milwaukee',
            'Ridgid',

            // Electrical & Industrial
            'Schneider Electric',
            'Siemens',
            'Omron',
            'ABB',
            'Legrand',
            'Panasonic Industrial',

            // Packaging / Warehouse Tech
            '3M',
            'Zebra',
            'Honeywell',
            'Brother',

            // Consumables & Chemicals
            'WD-40',
            'Loctite',
            'Sika',
            'Kimberly-Clark',
            'Clorox',

            // Tires
            'Bridgestone',
            'Michelin',
            'Goodyear',
            'Dunlop',
            'Yokohama',

            // Engine & Maintenance Parts
            'Fleetguard',
            'Baldwin',
            'Donaldson',
            'Mann+Hummel',
            'Wix',
            'Fram',
            'Bosch Automotive',

            // Drivetrain, Belts, Bearings
            'Gates',
            'Dayco',
            'SKF',
            'Timken',
            'NTN',
            'NSK',
            'Continental',

            // Electrical / Sensors
            'Denso',
            'Delphi',
            'NGK',
            'Hitachi Automotive',
            'Hella',

            // Fluids & Lubricants
            'Castrol',
            'Shell',
            'Mobil',
            'TotalEnergies',
            'Chevron',
            'Prestone',

            // Brakes & Suspension
            'Bendix',
            'WABCO',
            'Meritor',
            'Haldex',
            'Monroe',
            'KYB',

            // OEM Truck Brands
            'Isuzu',
            'Hino',
            'Fuso',
            'Toyota',
            'Nissan',
            'Hyundai',
            'Volvo',
            'Scania',
            'MAN',

            // Trailer & Body Parts
            'JOST',
            'BPW',
            'SAF-Holland',
            'Knorr-Bremse',

            // Others
            'Motolite',
            'Caltex',
            'Motul',
            'Valvoline',
            'Osram',
        ];

        foreach ($makes as $make) {
            Make::create([
                'name' => $make,
                'is_active' => true,
            ]);
        }
    }
}
