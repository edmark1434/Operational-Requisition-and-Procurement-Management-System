<?php

namespace Database\Factories;

use App\Models\Returns;
use App\Models\Delivery;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReturnsFactory extends Factory
{
    protected $model = Returns::class;

    public function definition(): array
    {
        return [
            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'return_date' => $this->faker->dateTimeBetween('-1 month', 'now')->format('Y-m-d'),
            'status' => $this->faker->randomElement(['PENDING', 'APPROVED', 'REJECTED']),
            'remarks' => $this->faker->optional()->sentence(),
            'delivery_id' => Delivery::factory(),
        ];
    }
}
