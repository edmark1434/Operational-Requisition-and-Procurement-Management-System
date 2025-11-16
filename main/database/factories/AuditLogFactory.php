<?php

namespace Database\Factories;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AuditLogFactory extends Factory
{
    protected $model = AuditLog::class;

    public function definition(): array
    {
        return [
            'type' => $this->faker->randomElement(AuditLog::TYPES),
            'description' => $this->faker->sentence(),
            'user_id' => User::factory(),
            // created_at exists in your table but timestamps are disabled
            'created_at' => now(),
        ];
    }
}
