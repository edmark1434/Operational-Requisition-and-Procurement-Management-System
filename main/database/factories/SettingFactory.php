<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Setting;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\setting>
 */
class SettingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Setting::class;
    public function definition(): array
    {
        return [
            'category' => $this->faker->randomElement(['System', 'User', 'Notification', 'Display', 'Security']),
            'key' => $this->faker->unique()->word(),
            'value' => $this->faker->sentence(3),
            'description' => $this->faker->optional()->sentence(8),
        ];
    }
}
