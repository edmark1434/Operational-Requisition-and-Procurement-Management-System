<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;

class Suppliers extends Controller
{
    public function index()
    {
        return Inertia::render('tabs/suppliers');
    }
}
