<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;

class Users extends Controller
{
    protected $base_path = "tabs/08-Users";
    public function index()
    {
        return Inertia::render($this->base_path .'/users');
    }
}
