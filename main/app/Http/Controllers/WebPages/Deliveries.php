<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

use Illuminate\Http\Request;

class Deliveries extends Controller
{
    protected $base_path = "tabs/10-Deliveries";
    public function index()
    {
        return Inertia::render($this->base_path .'/Deliveries');
    }
    public function create(){
        return Inertia::render($this->base_path .'/PurchaseOrderForm');
    }
    public function edit($id){
        return Inertia::render($this->base_path .'/PurchaseOrderEdit', [
            'purchaseId' => (int)$id
        ]);
    }
}

