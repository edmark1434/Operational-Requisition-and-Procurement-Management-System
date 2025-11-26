<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
class Contacts extends Controller
{
    protected $base_path = "tabs/14-Contacts";
    public function index()
    {
        return Inertia::render($this->base_path . '/Main');
    }
}
