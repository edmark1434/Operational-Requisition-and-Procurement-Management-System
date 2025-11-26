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
    public function store_category(){
        return Inertia::render($this->base_path .'/components/CategoryAdd');
    }
    public function edit_category($id){
        return Inertia::render($this->base_path .'/components/CategoryEdit', [
            'categoryId' => (int)$id
        ]);
    }
    public function store_make(){
        return Inertia::render($this->base_path .'/components/MakeAdd');
    }
    public function edit_make($id){
        return Inertia::render($this->base_path .'/components/MakeEdit', [
            'makeId' => (int)$id
        ]);
    }
}

