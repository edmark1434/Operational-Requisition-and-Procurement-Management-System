<?php

namespace App\Http\Controllers\Supplier;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class SupplierController extends Controller
{
    protected $base_path = "tabs/05-Suppliers";
    public function index()
    {
        return Inertia::render($this->base_path .'/Suppliers');
    }
    public function store(){
        return Inertia::render($this->base_path .'/SupplierAdd');
    }
    public function edit($id){
        return Inertia::render($this->base_path .'/SupplierEdit', [
            'supplierId' => (int)$id
        ]);
    }
}
