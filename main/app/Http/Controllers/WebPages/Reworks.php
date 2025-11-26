<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
class Reworks extends Controller
{
    protected $base_path = "tabs/13-Reworks";
    public function index()
    {
        return Inertia::render($this->base_path . '/Main');
    }
}
