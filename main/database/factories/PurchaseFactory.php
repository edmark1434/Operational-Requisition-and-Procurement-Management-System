<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Purchase;
use App\Models\Requisition;
use App\Models\Supplier;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Purchase>
 */
class PurchaseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Purchase::class;
    public function definition(): array
    {
        return [
            'purchase_date' => $this->faker->date(),
            'total_cost' => $this->faker->randomFloat(2, 100, 10000), // ₱100–₱10,000
            'receipt_no' => $this->faker->unique()->numberBetween(100000, 999999),
            'receipt_photo' => $this->faker->imageUrl(640, 480, 'receipts', true, 'Receipt'),
            'payment_type' => $this->faker->randomElement(Purchase::PAYMENT_TYPE),
            'req_id' => Requisition::factory(), // assumes you have a Request model
            'supplier_id' => Supplier::factory(), // assumes you have a Supplier model
        ];
    }
}
