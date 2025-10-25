<?php

namespace App\Http\Controllers\Requisition;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class RequisitionController extends Controller
{
    protected $base_path = "tabs/02-Requisitions"; ## NAA SA resources/pages/tabs/etc
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
