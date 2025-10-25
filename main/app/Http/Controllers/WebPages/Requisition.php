<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;

class Requisition extends Controller
{
    protected $base_path = "tabs/02-Requisitions";
    public function index()
    {
        return Inertia::render($this->base_path .'/RequisitionMain/Requisitions');
    }
    public function requisitionForm()
    {
        return Inertia::render($this->base_path .'/RequisitionForm/RequisitionForm');
    }
    public function requisitionEdit($id)
    {
        return Inertia::render($this->base_path .'/RequisitionForm/RequisitionEdit', [
            'requisitionId' => (int)$id
        ]);
    }
}
