<?php

namespace Database\Factories;
use App\Models\UserPermission;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
use App\Models\Permission;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\userPermission>
 */
class UserPermissionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = UserPermission::class;
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'perm_id' => Permission::factory(),
        ];
    }
}
