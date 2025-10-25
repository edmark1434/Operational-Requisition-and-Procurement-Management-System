<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

use Illuminate\Http\Request;

class Inventory extends Controller
{
    protected $base_path = "tabs/03-Inventory";
    public function index()
    {
        return Inertia::render($this->base_path .'/Inventory');
    }
    public function store(){
        return Inertia::render($this->base_path .'/ItemAdd');
    }
    public function edit($id){
        return Inertia::render($this->base_path .'/ItemEdit', [
            'itemId' => (int)$id
        ]);
    }
}

