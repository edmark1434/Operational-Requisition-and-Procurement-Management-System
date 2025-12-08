<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use App\Models\Rework;
use App\Models\Service;
use App\Models\ReworkService;
use Inertia\Inertia;
class Reworks extends Controller
{
    protected $base_path = "tabs/13-Reworks";
    public function index()
    {
        $reworksService = ReworkService::all()->map(function($rework_service){
            return [
                'ID' => $rework_service->id,
                'REWORK_ID' => $rework_service->rework_id,
                'SERVICE_ID' => $rework_service->service_id,
            ];
        });
        $service = Service::where('is_active', true)->get()->map(function($service){
            return [
                'ID' => $service->id,
                'NAME' => $service->name,
                'DESCRIPTION' => $service->description,
                'HOURLY_RATE' => $service->hourly_rate,
                'VENDOR_ID' => $service->vendor_id,
                'CATEGORY_ID' => $service->category_id,
                'IS_ACTIVE' => $service->is_active,
            ];
        });
        $reworks = Rework::with([
            'originalDelivery.oldDelivery.purchaseOrder.vendor',
        ])->get()->map(function($rew) {
            return [
                'ID' => $rew->id,
                'CREATED_AT' => $rew->created_at,
                'STATUS' => $rew->status,
                'REMARKS' => $rew->remarks,
                'PO_ID' => $rew->originalDelivery?->oldDelivery?->purchaseOrder?->id,
                'DELIVERY_ID' => $rew->originalDelivery?->oldDelivery?->id,
                'SUPPLIER_NAMES' => $rew->originalDelivery?->oldDelivery?->purchaseOrder?->vendor?->name ?? 'Unknown Supplier',
                'SERVICES' => $rew->rework_services?->map(function($rs) {
                    $serv = $rs->service;
                    return [
                        'ID' => $serv->id,
                        'SERVICE_ID' => $serv->id,
                        'NAME' => $serv->name,
                        'DESCRIPTION' => $serv->description
                    ];
                })->toArray() ?? [],
            ];
        });
        return Inertia::render($this->base_path . '/Main',[
            'reworkServiceData' => $reworksService,
            'reworksData' => $reworks,
            'serviceData' => $service,
        ]);
    }
    public function store(){
        return Inertia::render($this->base_path .'/ReworkAdd');
    }
    public function edit($id){
        return Inertia::render($this->base_path .'/ReworkEdit', [
            'reworkId' => (int)$id
        ]);
    }
    
}
