<?php

namespace App\Http\Controllers\Supplier;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class SupplierController extends Controller
{
    protected $base_path = "tabs/05-SupplierController";
    public function index()
    {
        return Inertia::render($this->base_path .'/suppliers');
    }
}
