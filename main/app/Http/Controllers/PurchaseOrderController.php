<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\OrderItem;
use App\Models\OrderService;
use App\Models\PurchaseOrder;
use App\Models\RequisitionOrderItem;
use App\Models\RequisitionOrderService;
use Illuminate\Http\Request;
use Illuminate\Tests\Integration\Queue\Order;

class PurchaseOrderController extends Controller
{
    public function post(Request $request)
    {
        $validated = $request->validate([
            'REFERENCE_NO' => ['required', 'string', 'max:255'],
            'REQUISITION_IDS' => ['required', 'array'],
            'REQUISITION_IDS.*' => ['integer', 'exists:requisition,id'],
            'SUPPLIER_ID' => ['required', 'integer', 'exists:vendor,id'],
            'PAYMENT_TYPE' => ['required', 'string', 'in:Cash,Disbursement,Store Credit'],
            'ORDER_TYPE' => ['required', 'string', 'in:Items,Services'],
            'TOTAL_COST' => ['required', 'numeric', 'min:0'],
            'REMARKS' => ['nullable', 'string'],

            'ITEMS' => ['nullable', 'array'],
            'ITEMS.*.REQ_ITEM_ID' => ['required_with:ITEMS', 'integer', 'exists:requisition_item,id'],
            'ITEMS.*.ITEM_ID' => ['required_with:ITEMS', 'integer', 'exists:item,id'],
            'ITEMS.*.QUANTITY' => ['required_with:ITEMS', 'integer', 'min:1'],

            'SERVICES' => ['nullable', 'array'],
            'SERVICES.*.REQ_SERVICE_ID' => ['required_with:SERVICES', 'integer', 'exists:requisition_services,id'],
            'SERVICES.*.SERVICE_ID' => ['required_with:SERVICES', 'integer', 'exists:services,id'],
        ]);

        $finalPO = [
            'ref_no' => $validated['REFERENCE_NO'],
            'type' => $validated['ORDER_TYPE'],
            'created_at' => now(),
            'total_cost' => $validated['TOTAL_COST'],
            'payment_type' => $validated['PAYMENT_TYPE'],
            'remarks' => $validated['REMARKS'],
            'vendor_id' => $validated['SUPPLIER_ID'],
        ];
        $po = PurchaseOrder::query()->create($finalPO);
        $poId = $po->id;

        if ($validated['ORDER_TYPE'] === 'Items') {
            foreach ($validated['ITEMS'] as $reqItem) {
                $orderItem = [
                    'po_id' => $poId,
                    'item_id' => $reqItem['ITEM_ID'],
                    'quantity' => $reqItem['QUANTITY'],
                ];
                $createdOrderItem = OrderItem::query()->create($orderItem);

                RequisitionOrderItem::query()->create([
                    'po_item_id' => $createdOrderItem->id,
                    'req_item_id' => $reqItem['REQ_ITEM_ID'],
                ]);
            }
        }
        else {
            foreach ($validated['SERVICES'] as $reqService) {
                $orderService = [
                    'po_id' => $poId,
                    'service_id' => $reqService['SERVICE_ID'],
                ];
                $createdOrderService = OrderService::query()->create($orderService);

                RequisitionOrderService::query()->create([
                    'po_service_id' => $createdOrderService->id,
                    'req_service_id' => $reqService['REQ_SERVICE_ID'],
                ]);
            }
        }

        AuditLog::query()->create([
            'description' => 'Purchase order created: ' . $finalPO['ref_no'],
            'user_id' => auth()->id(),
            'type_id' => 4,
        ]);

        return back();
    }

    public function put(Request $request, $id)
    {
        $validated = $request->validate([
            'NAME' => 'required|string|max:255',
            'DESCRIPTION' => 'required|string',
            'HOURLY_RATE' => 'required|numeric|min:0',
            'CATEGORY' => 'required|exists:category,id',
            'VENDOR_ID' => 'nullable|exists:vendor,id',
        ]);

        $final = [
            'name' => $validated['NAME'],
            'description' => $validated['DESCRIPTION'],
            'hourly_rate' => $validated['HOURLY_RATE'],
            'category_id' => $validated['CATEGORY'],
            'vendor_id' => $validated['VENDOR_ID'] ?? null,
        ];

        Service::query()->findOrFail($id)->update($final);
        AuditLog::query()->create([
            'description' => 'Details of ' . $final['name'] . ' updated',
            'user_id' => auth()->id(),
            'type_id' => 20,
        ]);

        return back();
    }

    public function delete($id)
    {
        $service = Service::query()->findOrFail($id);
        $service->update(['is_active' => false]);

        AuditLog::query()->create([
            'description' => 'Service deleted: ' . $service->name,
            'user_id' => auth()->id(),
            'type_id' => 21,
        ]);

        return back();
    }
}
