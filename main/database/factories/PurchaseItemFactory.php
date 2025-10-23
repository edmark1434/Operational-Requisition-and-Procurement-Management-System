<?php

namespace Database\Factories;
use App\Models\PurchaseItem;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Purchase;
use App\Models\Item;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PurchaseItem>
 */
class PurchaseItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = PurchaseItem::class;
    public function definition(): array
    {
        return [
            'purchase_id' => Purchase::factory(), // Creates related Purchase
            'item_id' => Item::factory(),         // Creates related Item
            'quantity' => $this->faker->numberBetween(1, 50),
            'unit_price' => $this->faker->randomFloat(2, 10, 1000), // ₱10.00 - ₱1000.00
        ];
    }
}
