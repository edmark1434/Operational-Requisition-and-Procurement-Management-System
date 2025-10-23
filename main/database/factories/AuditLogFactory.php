<?php

namespace Database\Factories;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AuditLog>
 */
class AuditLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = AuditLog::class;
    public function definition(): array
    {
        return [
            'type' => $this->faker->randomElement(AuditLog::TYPES),
            'description' => $this->faker->sentence(),
            'user_id' => User::factory(),
        ];
    }
}
