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
        return Inertia::render($this->base_path .'/Users');
    }
    public function store(){
        return Inertia::render($this->base_path .'/UserAdd');
    }
    public function edit($id){
        return Inertia::render($this->base_path .'/UserEdit', [
            'userId' => (int)$id
        ]);
    }
}
