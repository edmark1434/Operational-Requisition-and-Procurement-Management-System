<?php

namespace Database\Factories;

use App\Models\Delivery;
use App\Models\DeliveryItem;
use App\Models\PurchaseOrder;
use App\Models\Item;
use Illuminate\Database\Eloquent\Factories\Factory;

class DeliveryItemFactory extends Factory
{
    protected $model = DeliveryItem::class;

    public function definition(): array
    {
        return [
            'delivery_id' => Delivery::factory(),
            'item_id' => Item::factory(),
            'quantity' => $this->faker->numberBetween(1, 50),
            'unit_price' => $this->faker->randomFloat(2, 50, 5000),
        ];
    }
}
