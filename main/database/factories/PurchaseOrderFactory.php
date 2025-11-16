<?php

namespace Database\Factories;

use App\Models\PurchaseOrder;
use App\Models\Requisition;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

class PurchaseOrderFactory extends Factory
{
    protected $model = PurchaseOrder::class;

    public function definition(): array
    {
        return [
            'references_no' => $this->faker->unique()->numerify('PO-#####'),
            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'total_cost' => $this->faker->randomFloat(2, 1000, 50000),
            'payment_type' => $this->faker->randomElement(PurchaseOrder::PAYMENT_TYPE),
            'status' => $this->faker->randomElement(['PENDING', 'APPROVED', 'REJECTED']),
            'remarks' => $this->faker->optional()->sentence(),
            'req_id' => Requisition::factory(),
            'supplier_id' => Supplier::factory(),
        ];
    }
}
