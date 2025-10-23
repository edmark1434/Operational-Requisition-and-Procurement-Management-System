<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\RequisitionItem;
use App\Models\Requisition;
use App\Models\Item;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RequisitionItem>
 */
class RequisitionItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = RequisitionItem::class;
    public function definition(): array
    {
        return [
            'req_id' => Requisition::factory(),
            'item_id' => Item::factory(),
            'quantity' => $this->faker->numberBetween(1, 100),
        ];
    }
}
