<?php

namespace Database\Factories;

use App\Models\OrderItem;
use App\Models\PurchaseOrder;
use App\Models\Item;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    public function definition(): array
    {
        return [
            'po_id' => PurchaseOrder::factory(),
            'item_id' => Item::factory(),
            'quantity' => $this->faker->numberBetween(1, 100),
        ];
    }
}
