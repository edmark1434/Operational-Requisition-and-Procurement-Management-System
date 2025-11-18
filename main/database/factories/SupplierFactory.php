<?php

namespace Database\Factories;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\supplier>
 */
class SupplierFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Supplier::class;
    public function definition(): array
    {
        return [
            'name' => $this->faker->company(),
            'email' => $this->faker->unique()->safeEmail(),
            'contact_info' => $this->faker->phoneNumber(),
            'allows_cash' => $this->faker->boolean(),
            'allows_disbursement' => $this->faker->boolean(),
            'allows_store_credit' => $this->faker->boolean(),
        ];
    }
}
