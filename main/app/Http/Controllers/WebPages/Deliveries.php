<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\Item;
use App\Models\OrderItem;
use App\Models\OrderService;
use App\Models\PurchaseOrder;
use App\Models\ReturnItem;
use App\Models\DeliveryItem;
use App\Models\DeliveryService;
use App\Models\Returns;
use App\Models\Rework;
use App\Models\ReworkService;
use App\Models\Service;
use App\Models\Vendor;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

use Illuminate\Http\Request;

class Deliveries extends Controller
{
    protected $base_path = "tabs/10-Deliveries";
    public function index()
    {
        return Inertia::render($this->base_path .'/Deliveries', [
            'deliveries' => Delivery::with('purchaseOrder.vendor')->get(),
            'deliveryItems' => DeliveryItem::with('item')->get(),
            'deliveryServices' => DeliveryService::with('service')->get(),
            'types' => Delivery::TYPES,
            'statuses' => Delivery::STATUS,
        ]);
    }
    public function store(){
        return Inertia::render($this->base_path .'/DeliveryAdd', [
            'purchaseOrders' => PurchaseOrder::with('vendor')->where('status', 'Issued')->get(),
            'returns' => Returns::with('originalDelivery')->where('status', 'Issued')->get(),
            'reworks' => Rework::with('originalDelivery')->where('status', 'Issued')->get(),

            'orderItems' => OrderItem::with('item')->get(),
            'orderServices' => OrderService::with('service')->get(),
            'returnItems' => ReturnItem::with('item')->get(),
            'reworkServices' => ReworkService::with('service')->get(),

            'types' => Delivery::TYPES,
            'statuses' => Delivery::STATUS,
            'items' => Item::all(),
            'services' => Service::all(),
            'vendors' => Vendor::all(),
            'deliveries' => Delivery::all(),
        ]);
    }

    public function edit($id)
    {
        $delivery = Delivery::with([
            'deliveryItems',
            'delivery_service',
            'purchaseOrder',
            'newDeliveriesFromReturns',
            'newDeliveriesFromReworks'
        ])->findOrFail($id);

        $formData = [
            'REFERENCE_NO' => $delivery->ref_no,
            'DELIVERY_TYPE' => $delivery->type,
            'PO_ID' => $delivery->po_id ? (string) $delivery->po_id : '',
            'RETURN_ID' => $delivery->newDeliveriesFromReturns->first()?->id
                ? (string) $delivery->newDeliveriesFromReturns->first()->id
                : '',
            'REWORK_ID' => $delivery->newDeliveriesFromReworks->first()?->id
                ? (string) $delivery->newDeliveriesFromReworks->first()->id
                : '',
            'RECEIPT_NO' => $delivery->receipt_no,
            'DELIVERY_DATE' => $delivery->delivery_date,
            'REMARKS' => $delivery->remarks ?? '',
            'STATUS' => $delivery->status,
            'RECEIPT_PHOTO' => null,
        ];

        $formItems = $delivery->deliveryItems->map(function ($item) {
            return [
                'item_id' => $item->item_id,
                'quantity' => $item->quantity,
                'ordered_qty' => $item->ordered_qty ?? 0,
                'unit_price' => $item->unit_price,
                'original_unit_price' => $item->original_unit_price ?? 0,
            ];
        });

        $formServices = $delivery->delivery_service->map(function ($service) {
            return [
                'service_id' => $service->service_id,
                'hourly_rate' => $service->hourly_rate,
                'original_hourly_rate' => $service->original_hourly_rate ?? 0,
                'hours' => $service->hours,
            ];
        });

        return Inertia::render($this->base_path . '/DeliveryEdit', [
            'purchaseOrders' => PurchaseOrder::with('vendor')
                ->where('status', 'Issued')
                ->orWhere('id', $delivery->po_id)
                ->get(),

            'returns' => Returns::with('originalDelivery')
                ->where('status', 'Issued')
                ->orWhereIn('id', $delivery->newDeliveriesFromReturns->pluck('id')->toArray())
                ->get(),

            'reworks' => Rework::with('originalDelivery')
                ->where('status', 'Issued')
                ->orWhereIn('id', $delivery->newDeliveriesFromReworks->pluck('id')->toArray())
                ->get(),

            'orderItems' => OrderItem::with('item')->get(),
            'orderServices' => OrderService::with('service')->get(),
            'returnItems' => ReturnItem::with('item')->get(),
            'reworkService' => ReworkService::with('service')->get(),

            'types' => Delivery::TYPES,
            'statuses' => Delivery::STATUS,
            'items' => Item::all(),
            'services' => Service::all(),
            'vendors' => Vendor::all(),
            'deliveries' => Delivery::all(),
            'deliveryId' => (int)$id,

            'form' => $formData,
            'formItems' => $formItems,
            'formServices' => $formServices,
        ]);
    }

    public function updateStatus(Request $request, $id){
        $delivery = Delivery::find($id);
        if(!$delivery){
            return response()->json(['message' => 'Delivery not found'], 404);
        }
        $delivery->status = $request->input('status');
        $delivery->save();
    }
}

