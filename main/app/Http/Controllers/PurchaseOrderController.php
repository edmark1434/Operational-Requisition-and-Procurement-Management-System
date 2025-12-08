<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\OrderItem;
use App\Models\OrderService;
use App\Models\PurchaseOrder;
use App\Models\Requisition;
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
            // Merge by ITEM_ID
            $mergedItems = [];

            foreach ($validated['ITEMS'] as $reqItem) {
                $itemId = $reqItem['ITEM_ID'];
                $quantity = $reqItem['QUANTITY'];
                $reqItemId = $reqItem['REQ_ITEM_ID'];

                if (!isset($mergedItems[$itemId])) {
                    $mergedItems[$itemId] = [
                        'quantity' => $quantity,
                        'req_item_ids' => [$reqItemId],
                    ];
                } else {
                    $mergedItems[$itemId]['quantity'] += $quantity;
                    $mergedItems[$itemId]['req_item_ids'][] = $reqItemId;
                }
            }

            foreach ($mergedItems as $itemId => $data) {
                // Create one OrderItem per unique item
                $createdOrderItem = OrderItem::query()->create([
                    'po_id' => $poId,
                    'item_id' => $itemId,
                    'quantity' => $data['quantity'],
                ]);

                // Link all original requisition items
                foreach ($data['req_item_ids'] as $reqItemId) {
                    RequisitionOrderItem::query()->create([
                        'po_item_id' => $createdOrderItem->id,
                        'req_item_id' => $reqItemId,
                    ]);
                }
            }
        } else {
            // Merge services by SERVICE_ID
            $mergedServices = [];

            foreach ($validated['SERVICES'] as $reqService) {
                $serviceId = $reqService['SERVICE_ID'];
                $reqServiceId = $reqService['REQ_SERVICE_ID'];

                if (!isset($mergedServices[$serviceId])) {
                    $mergedServices[$serviceId] = [
                        'req_service_ids' => [$reqServiceId],
                    ];
                } else {
                    $mergedServices[$serviceId]['req_service_ids'][] = $reqServiceId;
                }
            }

            foreach ($mergedServices as $serviceId => $data) {
                // Create one OrderService per unique service
                $createdOrderService = OrderService::query()->create([
                    'po_id' => $poId,
                    'service_id' => $serviceId,
                ]);

                // Link all original requisition services
                foreach ($data['req_service_ids'] as $reqServiceId) {
                    RequisitionOrderService::query()->create([
                        'po_service_id' => $createdOrderService->id,
                        'req_service_id' => $reqServiceId,
                    ]);
                }
            }
        }

        $this::markFullyOrderedRequisitions();

        AuditLog::query()->create([
            'description' => 'Purchase order created: ' . $finalPO['ref_no'],
            'user_id' => auth()->id(),
            'type_id' => 4,
        ]);

        return back();
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string'
        ]);

        $po = PurchaseOrder::findOrFail($id);
        $oldStatus = $po->status;

        // --- FIX: Map Frontend values to Database Allowed Values ---
        // Key = What React sends
        // Value = What your Database/Model allows (Must match public const STATUS)
        $statusMap = [
            'pending_approval'    => 'Pending',   // <--- This fixes your error
            'merged'              => 'Merged',
            'issued'              => 'Issued',
            'rejected'            => 'Rejected',
            'cancelled'           => 'Cancelled',
            'delivered'           => 'Delivered',
            'received'            => 'Received',

            // NOTE: Your Model/DB does NOT have 'Partially Delivered' in the allowed list.
            // You must either add it to your DB constraint or map it to 'Delivered' here.
            'partially_delivered' => 'Delivered',
        ];

        // check if the status sent is valid
        if (!array_key_exists($validated['status'], $statusMap)) {
            // Fallback: If it's already a valid capitalized status, just use it
            if (in_array($validated['status'], PurchaseOrder::STATUS)) {
                $cleanStatus = $validated['status'];
            } else {
                return back()->withErrors(['status' => 'Status not recognized by the database.']);
            }
        } else {
            $cleanStatus = $statusMap[$validated['status']];
        }

        // Update with the clean, DB-safe string
        $po->update([
            'status' => $cleanStatus
        ]);

        AuditLog::create([
            'description' => "Purchase Order {$po->ref_no} status updated from '{$oldStatus}' to '{$cleanStatus}'",
            'user_id' => auth()->id(),
            'type_id' => 8,
        ]);

        return back()->with('success', 'Purchase Order status updated successfully.');
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

    public static function markFullyOrderedRequisitions()
    {
        $requisitions = Requisition::query()
            ->whereIn('status', ['Approved', 'Partially Approved'])
            ->with(['requisition_items.req_order_items', 'requisition_services.req_order_services'])
            ->get();

        foreach ($requisitions as $req) {
            $hasItems = $req->requisition_items->count() > 0;
            $hasServices = $req->requisition_services->count() > 0;

            // Check if all items are ordered (if any items exist)
            $allItemsOrdered = !$hasItems || $req->requisition_items->every(fn($item) => $item->req_order_items->count() > 0); // No items = automatically satisfied

            // Check if all services are ordered (if any services exist)
            $allServicesOrdered = !$hasServices || $req->requisition_services->every(fn($service) => $service->req_order_services->count() > 0); // No services = automatically satisfied

            // Only mark as ordered if:
            // 1. At least one type exists (items OR services)
            // 2. All existing items/services are ordered
            if (($hasItems || $hasServices) && $allItemsOrdered && $allServicesOrdered) {
                $req->update(['status' => 'Ordered']);
            }
        }
    }

}
