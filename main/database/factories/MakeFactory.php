<?php

namespace Database\Factories;
use App\Models\Make;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Make>
 */
class MakeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Make::class;
    public function definition(): array
    {
        return [
              'name' => $this->faker->unique()->company(),
        ];
    }
}
