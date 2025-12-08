<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\Item;
use App\Models\Requisition;
use App\Models\PurchaseOrder;
use App\Models\Returns;
use App\Models\Rework;
use Inertia\Inertia;

use Illuminate\Http\Request;

class Dashboard extends Controller
{
    protected $base_path = "tabs/01-Dashboard";
    public function index()
    {
        $requisition = Requisition::all()->map(function ($req) {
            return [
                'ID' => $req->id,
                'TYPE' => $req->type,
                'CREATED_AT' => $req->created_at,
                'UPDATED_AT' => $req->updated_at,
                'STATUS' => $req->status,
                'REMARKS' => $req->remarks,
                'REQUESTOR' => $req->requestor,
                'NOTES' => $req->notes,
                'PRIORITY' => $req->priority,
                'USER_ID' => $req->user_id,
            ];
        });
        $purchase_orders = PurchaseOrder::with([
            'vendor',                // vendor for SUPPLIER_NAME
            'item' // nested relation to get items
        ])->get()->map(function ($po) {
            return [
                'ID' => $po->id,
                'REFERENCE_NO' => $po->ref_no,
                'ORDER_TYPE' => $po->type,
                'CREATED_AT' => $po->created_at,
                'TOTAL_COST' => $po->total_cost,
                'PAYMENT_TYPE' => $po->payment_type,
                'STATUS' => $po->status,
                'REMARKS' => $po->remarks,
                'REQUISITION_ID' => $po->req_id,
                'SUPPLIER_ID' => $po->vendor_id,
                'SUPPLIER_NAME' => optional($po->vendor)->name ?? 'Unknown Supplier',
                'ITEMS' => $po->item->map(function ($item) {
                    return [
                        'ID' => $item->id,
                        'ITEM_ID' => $item->item_id,
                        'NAME' => optional($item->item)->name ?? 'Unknown Item',
                        'QUANTITY' => $item->quantity,
                        'UNIT_PRICE' => optional($item->item)->unit_price ?? 0,
                        'CATEGORY_ID' => optional($item->item)->category_id ?? null,
                        'SELECTED' => true,
                    ];
                }),
            ];
});
        $deliveries = Delivery::with(['deliveryItems.item','purchaseOrder'])->get()->map(function ($delivery) {
            return [
                'ID' => $delivery->id,
                'DELIVERY_DATE' => $delivery->delivery_date,
                'TOTAL_COST' => $delivery->total_cost,
                'RECEIPT_NO' => $delivery->receipt_no,
                'RECEIPT_PHOTO' => $delivery->receipt_photo,
                'STATUS' => $delivery->status,
                'REMARKS' => $delivery->remarks,
                'PO_ID' => $delivery->po_id,
                'SUPPLIER_ID' => $delivery->purchaseOrder->vendor->id,
                'SUPPLIER_NAME' => $delivery->purchaseOrder->vendor->name,
                'TYPE' => $delivery->type,
                'ITEMS' => $delivery->deliveryItems->map(function ($item) {
                    $item = $item->item;
                    return [
                        'ID' => $item->id,
                        'ITEM_ID' => $item->id,
                        'NAME' => $item->name,
                        'QUANTITY' => $item->current_stock, // Adjust if your pivot column is different
                        'UNIT_PRICE' => $item->unit_price,
                        'BARCODE' => $item->barcode,
                    ];
                }),
            ];
        });

        $returns = Returns::with(['originalDelivery.oldDelivery.purchaseOrder.vendor'])->get()->map(function ($ret) {
            return [
                'ID' => $ret->id,
                'CREATED_AT' => $ret->created_at,
                'RETURN_DATE'=> $ret->return_date,
                'STATUS' => $ret->status,
                'REMARKS'=> $ret->remarks,
                'DELIVERY_ID'=> $ret->originalDelivery->old_delivery_id,
                'SUPPLIER_NAME' => $ret->originalDelivery->oldDelivery->purchaseOrder->vendor->name];
        });

        $reworks = Rework::with(
            'rework_service.service.order_service.purchase_order.vendor',
            'originalDelivery.oldDelivery')->get()->map(function ($rework) {

            $orderService = $rework->rework_service?->service?->order_service?->first();

            return [
                'ID' => $rework->id,
                'CREATED_AT' => $rework->created_at,
                'STATUS' => $rework->status,
                'REMARKS' => $rework->remarks,
                'PO_ID' => $orderService?->purchase_order?->id,
                'DELIVERY_ID' => $rework->originalDelivery?->oldDelivery?->id,
                'SUPPLIER_NAME' => $rework->rework_service?->service?->vendor?->name,
            ];
        });
        $items = Item::all()->map(function ($it) {
            return [
                'ITEM_ID' => $it->id,
                'BARCODE' => $it->barcode,
                'NAME' => $it->name,
                'DIMENSIONS' => $it->dimensions,
                'UNIT_PRICE' => $it->unit_price,
                'CURRENT_STOCK' => $it->current_stock,
                'MAKE_ID' => $it->make_id,
                'CATEGORY_ID' => $it->category_id, // Electrical
                'SUPPLIER_ID' => $it->vendor_id
            ];
        });
        return Inertia::render($this->base_path . '/Main',[
            'requisitions' => $requisition,
            'purchaseOrdersData' => $purchase_orders,
            'deliveries' => $deliveries,
            'returns' => $returns,
            'reworks' => $reworks,
            'items' => $items
        ]);


    }
}
