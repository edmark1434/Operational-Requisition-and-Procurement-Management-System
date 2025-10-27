<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Requisition;
use App\Models\User;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Requisition>
 */
class RequisitionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Requisition::class;
    public function definition(): array
    {
        return [
            'status' => $this->faker->randomElement(Requisition::STATUS),
            'remarks' => $this->faker->sentence(6),
            'user_id' => User::factory(), // Creates a related user if not existing
            'requestor' => $this->faker->name(),
            'notes' => $this->faker->paragraph(),
            'priority' => $this->faker->randomElement(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
            'description' => $this->faker->text(200),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
