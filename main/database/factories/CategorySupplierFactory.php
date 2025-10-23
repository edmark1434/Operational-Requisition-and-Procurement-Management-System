<?php

namespace Database\Factories;
use App\Models\CategorySupplier;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Category;
use App\Models\supplier;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CategorySupplier>
 */
class CategorySupplierFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = CategorySupplier::class;
    public function definition(): array
    {
        return [
            'category_id' => Category::factory(),
            'supplier_id' => supplier::factory(),
        ];
    }
}
