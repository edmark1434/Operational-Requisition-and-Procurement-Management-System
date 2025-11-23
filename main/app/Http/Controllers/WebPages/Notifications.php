<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
class Notifications extends Controller
{
    protected $base_path = "tabs/15-Notifications";
    public function index()
    {
        return Inertia::render($this->base_path . '/Main');
    }
}

