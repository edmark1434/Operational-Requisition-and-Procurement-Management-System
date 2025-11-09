<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Inertia\Response;
use App\Models\User;
use Carbon\Carbon;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {

        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        //get username
        $username = $request->username;
        $key = 'login_attempts_' . $username;
        $maxAttempts = 3;
        $lockoutMinutes = 2;
        //check if user is locked out 
        $attempts = Cache::get($key, 0);
        if(Cache::has("lockout_{$username}")){
            return back()->withErrors([
                'credentials' => 'Too many login attempts. Please try again in ' . $lockoutMinutes . ' minutes.',
            ])->onlyInput('username');
        }

        //get user by username
        $user = DB::select("SELECT * FROM get_users(NULL, ?)",[ $request->username ]);
        $user =  $user ? ((object) $user[0]) : NULL;
        if(!$user){
            return back()->withErrors([
                'credentials' => 'The provided credentials do not match our records.',
            ])->onlyInput('username');
        }else{
            if ($user && Hash::check($request->password, $user->password)) {
                $user = User::find($user->id);
                Auth::login($user, $request->boolean('remember'));
                Cache::forget($key); //clear login attempts on successful login
                $request->session()->regenerate();
                return redirect()->intended(route('dashboard', absolute: false))->with('success','Logged in successfully.');
            }
            
        $attempts = Cache::get($key, 0) + 1;
        Cache::put($key, $attempts, now()->addMinutes($lockoutMinutes));

        if ($attempts >= $maxAttempts) {
                Cache::put("lockout_{$username}", true, now()->addMinutes($lockoutMinutes));
                Cache::forget($key);
                return back()->withErrors([
                    'credentials' => 'Too many login attempts. Please try again in ' . $lockoutMinutes . ' minute(s).',
                ])->onlyInput('username');
        }
        return back()->withErrors([
        'credentials' => 'The provided credentials do not match our records. You have '. ($maxAttempts - $attempts) .' attempt(s) left.',
        ])->onlyInput('username'); 
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
