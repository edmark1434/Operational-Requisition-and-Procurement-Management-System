<?php

namespace App\Providers;
use App\Models\UserPermission;
use Inertia\Inertia;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;
class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (config('app.env') !== 'local') {
            URL::forceScheme('https');
        }
        Inertia::share([
            'auth' => fn () => auth()->user(),

            'user_permission' => function () {
                $user = auth()->user();
                if (!$user) {
                    return []; // no user logged in, return empty array
                }

                return UserPermission::with('permission')
                ->where('user_id', $user->id)
                ->get()
                ->map(fn($up) => $up->permission?->name) // use null-safe in case permission is missing
                ->toArray();
            },
        ]);
    }
}
