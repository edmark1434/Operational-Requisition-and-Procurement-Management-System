<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Supplier\SupplierController;
use App\Models\CategoryVendor;
use App\Models\Requisition;
use App\Models\RequisitionItem;
use App\Models\RequisitionService;
use App\Models\Vendor;
use Inertia\Inertia;

use Illuminate\Http\Request;

class Purchasing extends Controller
{
    protected $base_path = "tabs/04-Purchases";
    public function index()
    {
        return Inertia::render($this->base_path .'/Purchases', []);
    }
    public function create(){
        return Inertia::render($this->base_path .'/PurchaseOrderForm', [
            'requisitions' => Requisition::query()->where('status', 'Approved')->get(),
            'requisitionItems' => RequisitionItem::with('item')->get(),
            'requisitionServices' => RequisitionService::with('service', 'item')->get(),
            'vendors' => Vendor::query()->where('is_active', true)->get(),
            'vendorCategories' => CategoryVendor::with('vendor', 'category')->get(),
        ]);
    }
    public function edit($id){
        return Inertia::render($this->base_path .'/PurchaseOrderEdit', [
            'purchaseId' => (int)$id
        ]);
    }
}

