<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
class Contact extends Controller
{
    protected $base_path = "tabs/14-Contacts";
    public function index()
    {
        return Inertia::render($this->base_path . '/Main');
    }
    public function store(){
        return Inertia::render($this->base_path .'/ContactAdd');
    }
    public function edit($id){
        return Inertia::render($this->base_path .'/ContactEdit', [
            'contactId' => (int)$id
        ]);
    }
}
