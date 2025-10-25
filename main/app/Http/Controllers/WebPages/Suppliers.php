<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;

class Suppliers extends Controller
{
    protected $base_path = "tabs/05-Suppliers";
    public function index()
    {
        return Inertia::render($this->base_path .'/suppliers');
    }
}
