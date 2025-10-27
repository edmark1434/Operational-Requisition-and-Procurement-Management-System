<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;

class Roles extends Controller
{
    protected $base_path = "tabs/09-Roles";
    public function index()
    {
        return Inertia::render($this->base_path .'/roles');
    }
}
