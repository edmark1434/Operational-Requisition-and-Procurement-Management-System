<?php

namespace Database\Factories;

use App\Models\Delivery;
use App\Models\PurchaseOrder;
use Illuminate\Database\Eloquent\Factories\Factory;

class DeliveryFactory extends Factory
{
    protected $model = Delivery::class;

    public function definition(): array
    {
        return [
            'delivery_date' => $this->faker->date(),
            'total_cost' => $this->faker->randomFloat(2, 1000, 50000),
            'receipt_no' => $this->faker->unique()->numerify('RCPT-#####'),
            'receipt_photo' => null, // or fake path if needed
            'status' => $this->faker->randomElement(['PENDING', 'RECEIVED', 'CANCELLED']),
            'remarks' => $this->faker->optional()->sentence(),
            
            'po_id' => PurchaseOrder::factory(), // auto-create PO unless you replace it manually
        ];
    }
}
