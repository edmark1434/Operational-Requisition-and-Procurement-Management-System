<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Supplier\SupplierController;
use App\Models\Category;
use App\Models\CategoryVendor;
use App\Models\OrderItem;
use App\Models\OrderService;
use App\Models\PurchaseOrder;
use App\Models\Requisition;
use App\Models\RequisitionItem;
use App\Models\RequisitionOrderItem;
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
            'purchaseOrders' => PurchaseOrder::query()->whereNotIn('status', ['Issued', 'Delivered', 'Received'])->get(),
            'orderItems' => OrderItem::with('item')->get(),
            'orderServices' => OrderService::with('service', 'item')->get(),
            'requisitionOrderItems' => RequisitionOrderItem::with('req_item', 'po_item')->get(),
            'requisitionOrderServices' => RequisitionOrderItem::with('req_service', 'po_service')->get(),
            'categories' => Category::all(),
        ]);
    }
    public function edit($id){
        return Inertia::render($this->base_path .'/PurchaseOrderEdit', [
            'purchaseId' => (int)$id
        ]);
    }
}

