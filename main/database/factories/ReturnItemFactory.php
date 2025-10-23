<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\ReturnItem;
use App\Models\Requisition;
use App\Models\Item;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ReturnItem>
 */
class ReturnItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = ReturnItem::class;
    public function definition(): array
    {
        return [
            'req_id' => Requisition::factory(),
            'item_id' => Item::factory(),
            'quantity' => $this->faker->numberBetween(1, 100),
        ];
    }
}
