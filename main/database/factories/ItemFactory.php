<?php

namespace Database\Factories;
use App\Models\Item;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Category;
use App\Models\Make;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Item>
 */
class ItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Item::class;
    public function definition(): array
    {
        return [
            'barcode' => $this->faker->unique()->ean13(), // Generates a 13-digit barcode
            'name' => $this->faker->words(3, true), // Example: "Wireless Mouse Pro"
            'dimensions' => $this->faker->randomElement(['10x10x10', '5x5x2', '20x15x8']),
            'unit_price' => $this->faker->randomFloat(2, 10, 5000), // Between 10.00 and 5000.00
            'current_stock' => $this->faker->numberBetween(0, 500),
            'make_id' => Make::factory(),
            'category_id' => Category::factory(),
        ];
    }
}
