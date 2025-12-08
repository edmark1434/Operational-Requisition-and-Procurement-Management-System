<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use App\Models\ReturnItem;
use App\Models\Delivery;
use App\Models\Vendor;
use App\Models\Item;
use Illuminate\Http\Request;

class Returns extends Controller
{
    protected $base_path = "tabs/06-Returns";
    public function index()
    {
        $returns = \App\Models\Returns::with('originalDelivery.oldDelivery.purchaseOrder.vendor')->get()->map(function($ret){
            return [
                'ID' => $ret->id,
                'CREATED_AT' => $ret->created_at,
                'RETURN_DATE' => $ret->return_date,
                'STATUS' => $ret->status,
                'REMARKS' => $ret->remarks,
                'DELIVERY_ID' => $ret->originalDelivery?->old_delivery_id,
                'SUPPLIER_NAME' => $ret->originalDelivery?->oldDelivery?->purchaseOrder?->vendor?->name ?? 'Unknown Supplier',
            ];
        });
        $returnsItem = ReturnItem::all()->map(function($ret_item){
            return [
                'ID' => $ret_item->id,
                'RETURN_ID' => $ret_item->return_id,
                'ITEM_ID' => $ret_item->item_id,
                'QUANTITY' => $ret_item->quantity,
            ];
        });
        $delivery = Delivery::with('purchaseOrder.vendor','deliveryItems')->get()->map(function($del){
            return [
                'ID' => $del->id,
                'DELIVERY_DATE' => $del->delivery_date,
                'TOTAL_COST' => $del->total_cost,
                'RECEIPT_NO' => $del->receipt_no,
                'RECEIPT_PHOTO' => $del->receipt_photo,
                'STATUS' => $del->status,
                'REMARKS' => $del->remarks,
                'PO_ID' => $del->po_id,
                'SUPPLIER_ID' => $del->purchaseOrder?->vendor_id ?? null,
                'SUPPLIER_NAME' => $del->purchaseOrder?->vendor?->name ?? 'Unknown Supplier',
                'TOTAL_ITEMS' => $del->deliveryItems->count(),
                'DELIVERY_TYPE' => $del->type,
                'ITEMS' => $del->deliveryItems->map(function($del_item) {
                    $item = $del_item->item;
                    return [
                        'ID' => $item?->id,
                        'ITEM_ID' => $item?->id,
                        'NAME' => $item?->name,
                        'ITEM_NAME' => $item?->name,
                        'QUANTITY' => $del_item?->quantity ?? 0,

//                        'QUANTITY' => $item?->requisition_item?->approved_quantity ?? 0,                        'UNIT_PRICE' => $item?->unit_price,
                        'BARCODE' => $item?->barcode,
                        'CATEGORY' => $item?->category?->name,
                    ];
                }),
            ];
        });
        $vendor = Vendor::where('is_active', true)->get()->map(function ($ven) {
            return [
                'ID' => $ven->id,
                'NAME' => $ven->name,
                'EMAIL' => $ven->email,
                'CONTACT_NUMBER' => $ven->contact_number,
                'ALLOWS_CASH' => $ven->allows_cash,
                'ALLOWS_DISBURSEMENT' => $ven->allows_disbursement,
                'ALLOWS_STORE_CREDIT' => $ven->allows_store_credit
            ];
        });
        $inventory = Item::where('is_active', true)->get()->map(function ($item) {
            return [
                'ID' => $item->id,
                'BARCODE' => $item->barcode,
                'NAME' => $item->name,
                'DIMENSIONS' => $item->dimensions,
                'UNIT_PRICE' => $item->unit_price,
                'CURRENT_STOCK' => $item->current_stock,
                'MAKE_ID' => $item->make_id,
                'CATEGORY_ID' => $item->category_id,
                'SUPPLIER_ID' => $item->vendor_id,

            ];
        });
        return Inertia::render($this->base_path .'/Returns',
            [
                'returnsData' => $returns,
                'returnsItemData' => $returnsItem,
                'deliveriesData' => $delivery,
                'suppliersData' => $vendor,
                'itemsData' => $inventory,
            ]);
    }
    public function store(){
        return Inertia::render($this->base_path .'/ReturnAdd');
    }
    public function edit($id){
        return Inertia::render($this->base_path .'/ReturnEdit', [
            'returnId' => (int)$id
        ]);
    }
    public function updateStatus(Request $request, $id)
    {
        $status = $request->input('status');
        $return = \App\Models\Returns::findOrFail($id);
        $return->status = $status;
        $return->save();
        // return response()->json(['message' => 'Return status updated successfully.']);
    }
}
