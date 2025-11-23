<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

use Illuminate\Http\Request;

class Dashboard extends Controller
{
    protected $base_path = "tabs/01-Dashboard";
    public function index()
    {
        return Inertia::render($this->base_path . '/Main');
    }
}
