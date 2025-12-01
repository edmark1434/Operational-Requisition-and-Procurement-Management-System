<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Http\Controllers\Supplier\SupplierController;
use App\Models\Category;
use App\Models\CategoryVendor;
use App\Models\OrderItem;
use App\Models\OrderService;
use App\Models\Requisition;
use App\Models\RequisitionItem;
use App\Models\RequisitionOrderItem;
use App\Models\RequisitionOrderService;
use App\Models\RequisitionService;
use App\Models\Vendor;
use Inertia\Inertia;

use Illuminate\Http\Request;

class Purchasing extends Controller
{
    protected $base_path = "tabs/04-Purchases";
        public function index()
    {
        $purchases = PurchaseOrder::with(
            'vendor',
            'requisition.requisition_items.item',
            'service.service'
        )
        ->get()
        ->map(function ($po) {

            // Normalize fields for frontend consistency
            $type = strtolower(trim($po->type));            // items / services
            $status = strtolower(trim($po->status));        // pending_approval / approved / completed

            return [
                'ID'             => $po->id,
                'REFERENCE_NO'   => $po->ref_no,
                'CREATED_AT'     => $po->created_at,
                'TOTAL_COST'     => $po->total_cost,
                'PAYMENT_TYPE'   => $po->payment_type,
                'STATUS'         => $status,
                'SUPPLIER_ID'    => $po->vendor_id,
                'SUPPLIER_NAME'  => $po->vendor->name ?? '',
                'REQUISITION_ID' => $po->req_id,
                'ORDER_TYPE'     => $type,                   // items / services
                'REMARKS'        => $po->remarks,

                // -------------------------------
                // ITEMS: requisition → requisition_items → item
                // -------------------------------
                'ITEMS' => $type === 'items' && $po->requisition
                    ? $po->requisition->requisition_items->map(function ($reqItem) {
                        return [
                            'ID'          => $reqItem->id,
                            'ITEM_ID'     => $reqItem->item->id,
                            'NAME'        => $reqItem->item->name,
                            'QUANTITY'    => $reqItem->quantity,
                            'UNIT_PRICE'  => $reqItem->item->unit_price,
                            'CATEGORY_ID' => $reqItem->item->category_id,
                            'SELECTED'    => true,
                        ];
                    })->toArray()
                    : [],

                // -------------------------------
                // SERVICES: order_service → service
                // -------------------------------
                'SERVICES' => $type === 'services'
                    ? $po->service->map(function ($os) {
                        return [
                            'ID'           => $os->id,
                            'SERVICE_ID'   => $os->service->id,
                            'NAME'         => $os->service->name,
                            'DESCRIPTION'  => $os->service->description,
                            'HOURLY_RATE'  => $os->service->hourly_rate,
                            'CATEGORY_ID'  => $os->service->category_id,
                            'SELECTED'     => true
                        ];
                    })->toArray()
                    : [],
            ];
        });

        return Inertia::render($this->base_path . '/Purchases', [
            'purchaseOrdersData' => $purchases->values()->toArray()  // ensure plain array
        ]);
    }
    public function create(){
        return Inertia::render($this->base_path .'/PurchaseOrderForm', [
            'requisitions' => Requisition::query()->where('status', 'Approved')->get(),
            'requisitionItems' => RequisitionItem::with('item')->get(),
            'requisitionServices' => RequisitionService::with('service')->get(),
            'vendors' => Vendor::query()->where('is_active', true)->get(),
            'vendorCategories' => CategoryVendor::with('vendor', 'category')->get(),
            'purchaseOrders' => PurchaseOrder::query()->whereNotIn('status', ['Issued', 'Delivered', 'Received'])->get(),
            'orderItems' => OrderItem::with('item')->get(),
            'orderServices' => OrderService::with('service', 'item')->get(),
            'requisitionOrderItems' => RequisitionOrderItem::with('req_item', 'po_item')->get(),
            'requisitionOrderServices' => RequisitionOrderService::with('req_service', 'po_service')->get(),
            'categories' => Category::all(),
        ]);
    }
    public function edit($id){
        return Inertia::render($this->base_path .'/PurchaseOrderEdit', [
            'purchaseId' => (int)$id
        ]);
    }
}

