<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;

class Users extends Controller
{
    public function index()
    {
        return Inertia::render('tabs/users');
    }
}
