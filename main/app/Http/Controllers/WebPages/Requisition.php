<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;

class Requisition extends Controller
{
    public function index()
    {
        return Inertia::render('tabs/req/requisitions');
    }
    public function requisitionForm()
    {
        return Inertia::render('tabs/req/RequisitionForm/RequisitionForm');
    }
    public function requisitionEdit($id)
    {
        return Inertia::render('tabs/req/RequisitionForm/RequisitionEdit', [
            'requisitionId' => (int)$id
        ]);
    }
}
