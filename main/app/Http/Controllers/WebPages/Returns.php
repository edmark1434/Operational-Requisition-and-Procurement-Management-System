<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;

class Returns extends Controller
{
    protected $base_path = "tabs/06-Returns";
    public function index()
    {
        return Inertia::render($this->base_path .'/returns');
    }
}
