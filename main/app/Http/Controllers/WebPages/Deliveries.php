<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\Item;
use App\Models\OrderItem;
use App\Models\OrderService;
use App\Models\PurchaseOrder;
use App\Models\ReturnItem;
use App\Models\Returns;
use App\Models\Rework;
use App\Models\ReworkService;
use App\Models\Service;
use Inertia\Inertia;

use Illuminate\Http\Request;

class Deliveries extends Controller
{
    protected $base_path = "tabs/10-Deliveries";
    public function index()
    {
        return Inertia::render($this->base_path .'/Deliveries', [
            'deliveries' => Delivery::all(),
            'types' => Delivery::TYPES,
            'statuses' => Delivery::STATUS,
        ]);
    }
    public function store(){
        return Inertia::render($this->base_path .'/DeliveryAdd', [
            'purchaseOrders' => PurchaseOrder::query()->where('status', 'Issued')->get(),
            'returns' => Returns::query()->where('status', 'Issued')->get(),
            'reworks' => Rework::query()->where('status', 'Issued')->get(),

            'orderItems' => OrderItem::with('item')->get(),
            'orderServices' => OrderService::with('service')->get(),
            'returnItems' => ReturnItem::with('item')->get(),
            'reworkService' => ReworkService::with('service')->get(),

            'types' => Delivery::TYPES,
            'statuses' => Delivery::STATUS,
            'items' => Item::all(),
            'services' => Service::all()
        ]);
    }
    public function edit($id){
        return Inertia::render($this->base_path .'/DeliveryEdit', [
            'deliveryId' => (int)$id
        ]);
    }
}

