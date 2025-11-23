<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
class MakesAndCategories extends Controller
{
    protected $base_path = "tabs/11-MakesAndCategories";
    public function index()
    {
        return Inertia::render($this->base_path . '/Main');
    }
}

