<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
class Services extends Controller
{
    protected $base_path = "tabs/12-Services";
    public function index()
    {
        return Inertia::render($this->base_path . '/Main');
    }
}
