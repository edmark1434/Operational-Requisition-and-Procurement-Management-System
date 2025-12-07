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
            'orderItems.requisition_order_item.req_item',
            'orderServices.requisition_order_service.req_service',
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
                'ALLOWS_CASH'  => $po->vendor->allows_cash ?? '',
                'ALLOWS_DISBURSEMENT'  => $po->vendor->allows_disbursement ?? '',
                'ALLOWS_STORE_CREDIT'  => $po->vendor->allows_store_credit ?? '',
                // 'REQUISITION_ID' => $type === 'items' ? $po->orderItems->requisition_order_item->req_item->req_id ?? null : $po->orderServices->requisition_order_service->req_service->req_id ?? null,
                'ORDER_TYPE'     => $type,                   // items / services
                'REMARKS'        => $po->remarks,

                // -------------------------------
                // ITEMS: requisition → requisition_items → item
                // -------------------------------
                'ITEMS' => $type === 'items' && $po->orderItems->isNotEmpty()
                    ? $po->orderItems->map(function ($orderItem) {
                        $reqItem = $orderItem->requisition_order_item->req_item ?? null;
                        return [
                            'ID'          => $reqItem->id ?? null,
                            'ITEM_ID'     => $reqItem->item->id ?? null,
                            'NAME'        => $reqItem->item->name ?? null,
                            'QUANTITY'    => $reqItem->quantity,
                            'UNIT_PRICE'  => $reqItem->item->unit_price ?? null,
                            'CATEGORY_ID' => $reqItem->item->category_id ?? null,
                            'SELECTED'    => true,
                            'REQUISITION_DATE' => $reqItem->requisition->created_at ?? null,
                            'REQUISITION_ID' => $reqItem->req_id ?? null,
                            'REQUESTOR' => $reqItem->requisition->requestor ?? null,
                            'PRIORITY' => $reqItem->requisition->priority ?? null,
                        ];
                    })->toArray()
                    : [],

                // -------------------------------
                // SERVICES: order_service → service
                // -------------------------------
                'SERVICES' => $type === 'services' && $po->orderServices->isNotEmpty()
                    ? $po->orderServices->requisition_order_service->req_service->map(function ($os) {
                        return [
                            'ID'           => $os->id,
                            'SERVICE_ID'   => $os->service->id,
                            'NAME'         => $os->service->name,
                            'DESCRIPTION'  => $os->service->description,
                            'HOURLY_RATE'  => $os->service->hourly_rate,
                            'CATEGORY_ID'  => $os->service->category_id,
                            'SELECTED'     => true,
                            'REQUESTION_ID' => $os->req_id ?? null,
                            'REQUESTOR' => $os->requisition->requestor ?? null,
                            'PRIORITY' => $os->requisition->priority ?? null,
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
            'orderServices' => OrderService::with('service')->get(),
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

