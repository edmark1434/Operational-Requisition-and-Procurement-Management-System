<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\PurchaseReturn;
use App\Models\Purchase;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PurchaseReturn>
 */
class PurchaseReturnFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = PurchaseReturn::class;
    public function definition(): array
    {
        return [
            'return_date' => $this->faker->date(),
            'status' => $this->faker->randomElement(PurchaseReturn::STATUS),
            'remarks' => $this->faker->text(),
            'purchase_id' => Purchase::factory(),
        ];
    }
}
