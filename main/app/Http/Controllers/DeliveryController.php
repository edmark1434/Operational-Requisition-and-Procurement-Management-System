<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Delivery;
use App\Models\DeliveryItem;
use App\Models\DeliveryService;
use App\Models\Item;
use App\Models\PurchaseOrder;
use App\Models\Requisition;
use App\Models\ReturnDelivery;
use App\Models\Returns;
use App\Models\Rework;
use App\Models\ReworkDelivery;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class DeliveryController extends Controller
{
    public function post(Request $request)
    {
        $validated = $request->validate([
            'ref_no' => ['required', 'string', 'max:255'],
            'delivery_type' => ['required', 'string', 'max:255'],
            'delivery_date' => ['required', 'date'],
            'total_cost' => ['required', 'numeric', 'min:0'],
            'receipt_no' => ['required', 'string', 'max:255'],
            'receipt_photo' => ['nullable', 'string'], // Set to accept string (base64)
            'status' => ['required', 'string', 'max:255'],
            'remarks' => ['nullable', 'string', 'max:1000'],
            'po_id' => ['nullable', 'integer', 'exists:purchase_order,id'],
            'return_id' => ['nullable', 'integer', 'exists:returns,id'],
            'rework_id' => ['nullable', 'integer', 'exists:reworks,id'],

            'items' => ['nullable', 'array'],
            'items.*.item_id' => ['required_with:items', 'integer', 'exists:item,id'],
            'items.*.quantity' => ['required_with:items', 'integer', 'min:1'],
            'items.*.ordered_qty' => ['nullable', 'integer', 'min:1'],
            'items.*.unit_price' => ['required_with:items', 'numeric', 'min:0'],
            'items.*.original_unit_price' => ['nullable', 'numeric', 'min:0'],

            'services' => ['nullable', 'array'],
            'services.*.service_id' => ['required_with:services', 'integer', 'exists:services,id'],
            'services.*.hourly_rate' => ['required_with:services', 'numeric', 'min:0'],
            'services.*.original_hourly_rate' => ['nullable', 'numeric', 'min:0'],
            'services.*.hours' => ['required_with:services', 'numeric', 'min:1'],
        ]);

        $path = null;
        if (!empty($validated['receipt_photo'])) {
            $path = $this->storeBase64Image($validated['receipt_photo'], 'receipts');
        }

        $final = [
            'ref_no' => $validated['ref_no'],
            'type' => $validated['delivery_type'],
            'delivery_date' => $validated['delivery_date'],
            'total_cost' => $validated['total_cost'],
            'receipt_no' => $validated['receipt_no'],
            'receipt_photo' => $path,
            'status' => $validated['status'],
            'remarks' => $validated['remarks'] ?? null,
            'po_id' => $validated['po_id'] ?? null,
        ];
        $delivery = Delivery::query()->create($final);
        $deliveryId = $delivery->id;

        if (!empty($validated['items'])) {
            foreach ($validated['items'] as $item) {
                DeliveryItem::query()->create([
                    'delivery_id' => $deliveryId,
                    'item_id' => $item['item_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                ]);

                // Update inventory
                $inventoryItem = Item::query()->find($item['item_id']);
                if ($inventoryItem) {
                    $inventoryItem->current_stock += $item['quantity'];
                    $inventoryItem->unit_price = $item['unit_price']; // update the unit price
                    $inventoryItem->save();
                }
            }
        }
        if (!empty($validated['services'])) {
            foreach ($validated['services'] as $service) {
                // Create the delivery service record
                DeliveryService::query()->create([
                    'delivery_id' => $deliveryId,
                    'service_id' => $service['service_id'],
                    'hourly_rate' => $service['hourly_rate'],
                    'hours' => $service['hours'] ?? 0,
                ]);

                // Update the service's standard hourly rate
                $serviceRecord = Service::query()->find($service['service_id']);
                if ($serviceRecord) {
                    $serviceRecord->hourly_rate = $service['hourly_rate'];
                    $serviceRecord->save();
                }
            }
        }

        if (!empty($validated['po_id'])) {
            PurchaseOrder::query()->find($validated['po_id'])
                ->update([
                    'status' => 'Delivered',
                ]);
        }

        if ($validated['delivery_type'] == 'Item Return') {
            Returns::query()->find($validated['return_id'])
                ->update([
                    'status' => 'Delivered',
                ]);

            ReturnDelivery::query()
                ->where('return_id', $validated['return_id'])
                ->update([
                    'new_delivery_id' => $deliveryId,
                ]);
        }
        if ($validated['delivery_type'] == 'Service Rework') {
            Rework::query()->find($validated['rework_id'])
                ->update([
                    'status' => 'Delivered',
                ]);

            ReworkDelivery::query()
                ->where('rework_id', $validated['rework_id'])
                ->update([
                    'new_delivery_id' => $deliveryId,
                ]);
        }

        $this::markDeliveredRequisitions();
        $this::markDeliveredPurchaseOrders();
        $this::markDeliveredReturns();
        $this::markDeliveredReworks();

        AuditLog::query()->create([
            'description' => 'Delivery recorded: ' . $final['ref_no'],
            'user_id' => auth()->id(),
            'type_id' => 7,
        ]);

        return back();
    }

    public function put(Request $request, $id)
    {
        $delivery = Delivery::findOrFail($id);

        $validated = $request->validate([
            'ref_no' => ['required', 'string', 'max:255'],
            'delivery_type' => ['required', 'string', 'max:255'],
            'delivery_date' => ['required', 'date'],
            'total_cost' => ['required', 'numeric', 'min:0'],
            'receipt_no' => ['required', 'string', 'max:255'],
            'receipt_photo' => ['nullable', 'string'], // base64 string
            'status' => ['required', 'string', 'max:255'],
            'remarks' => ['nullable', 'string', 'max:1000'],
            'po_id' => ['nullable', 'integer', 'exists:purchase_order,id'],
            'return_id' => ['nullable', 'integer', 'exists:returns,id'],
            'rework_id' => ['nullable', 'integer', 'exists:reworks,id'],

            'items' => ['nullable', 'array'],
            'items.*.item_id' => ['required_with:items', 'integer', 'exists:item,id'],
            'items.*.quantity' => ['required_with:items', 'integer', 'min:1'],
            'items.*.unit_price' => ['required_with:items', 'numeric', 'min:0'],

            'services' => ['nullable', 'array'],
            'services.*.service_id' => ['required_with:services', 'integer', 'exists:services,id'],
            'services.*.hourly_rate' => ['required_with:services', 'numeric', 'min:0'],
            'services.*.hours' => ['required_with:services', 'numeric', 'min:1'],
        ]);

        // Only update the receipt photo if provided
        if (!empty($validated['receipt_photo'])) {
            $delivery->receipt_photo = $this->storeBase64Image($validated['receipt_photo'], 'receipts');
        }

        // Update other fields
        $delivery->update([
            'ref_no' => $validated['ref_no'],
            'type' => $validated['delivery_type'],
            'delivery_date' => $validated['delivery_date'],
            'total_cost' => $validated['total_cost'],
            'receipt_no' => $validated['receipt_no'],
            'status' => $validated['status'],
            'remarks' => $validated['remarks'] ?? null,
            'po_id' => $validated['po_id'] ?? null,
        ]);

        // Inventory: remove old items
        foreach ($delivery->deliveryItems as $oldItem) {
            $inventoryItem = Item::find($oldItem->item_id);
            if ($inventoryItem) {
                $inventoryItem->current_stock -= $oldItem->quantity;
                $inventoryItem->save();
            }
        }
        $delivery->deliveryItems()->delete();

        // Add new items and update inventory
        if (!empty($validated['items'])) {
            foreach ($validated['items'] as $item) {
                $delivery->deliveryItems()->create([
                    'item_id' => $item['item_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                ]);

                $inventoryItem = Item::find($item['item_id']);
                if ($inventoryItem) {
                    $inventoryItem->current_stock += $item['quantity'];
                    $inventoryItem->unit_price = $item['unit_price']; // update the unit price
                    $inventoryItem->save();
                }
            }
        }

        // Remove old services
        $delivery->delivery_service()->delete();

        // Add new services and update the hourly rate
        if (!empty($validated['services'])) {
            foreach ($validated['services'] as $service) {
                // Add to delivery_service
                $delivery->delivery_service()->create([
                    'service_id' => $service['service_id'],
                    'hourly_rate' => $service['hourly_rate'],
                    'hours' => $service['hours'],
                ]);

                // Update the standard hourly rate of the service
                $serviceRecord = Service::query()->find($service['service_id']);
                if ($serviceRecord) {
                    $serviceRecord->hourly_rate = $service['hourly_rate'];
                    $serviceRecord->save();
                }
            }
        }

        // Update related POs / Returns / Reworks
        if (!empty($validated['po_id'])) {
            PurchaseOrder::find($validated['po_id'])->update(['status' => 'Delivered']);
        }

        if ($validated['delivery_type'] === 'Item Return' && !empty($validated['return_id'])) {
            Returns::find($validated['return_id'])->update(['status' => 'Delivered']);
            ReturnDelivery::where('return_id', $validated['return_id'])
                ->update(['new_delivery_id' => $delivery->id]);
        }

        if ($validated['delivery_type'] === 'Service Rework' && !empty($validated['rework_id'])) {
            Rework::find($validated['rework_id'])->update(['status' => 'Delivered']);
            ReworkDelivery::where('rework_id', $validated['rework_id'])
                ->update(['new_delivery_id' => $delivery->id]);
        }

        $this::markDeliveredRequisitions();
        $this::markDeliveredPurchaseOrders();
        $this::markDeliveredReturns();
        $this::markDeliveredReworks();


        AuditLog::create([
            'description' => 'Delivery updated: ' . $delivery->ref_no,
            'user_id' => auth()->id(),
            'type_id' => 8,
        ]);

        return back();
    }

    public function delete($id)
    {
        $delivery = Delivery::with(['deliveryItems', 'delivery_service', 'returns', 'reworks'])->findOrFail($id);

        // Delete items and services
        $delivery->deliveryItems()->delete();
        $delivery->delivery_service()->delete();

        // Reset linked purchase order status
        if ($delivery->po_id) {
            $delivery->purchaseOrder?->update(['status' => 'Issued']);
        }

        // Reset linked return statuses and pivot
        if ($delivery->type === 'Item Return') {
            foreach ($delivery->returns as $ret) {
                $ret->update(['status' => 'Issued']);
            }
            $delivery->returns()->updateExistingPivot($delivery->returns->pluck('id')->toArray(), ['new_delivery_id' => null]);
        }

        // Reset linked rework statuses and pivot
        if ($delivery->type === 'Service Rework') {
            foreach ($delivery->reworks as $rework) {
                $rework->update(['status' => 'Issued']);
            }
            $delivery->reworks()->updateExistingPivot($delivery->reworks->pluck('id')->toArray(), ['new_delivery_id' => null]);
        }

        // Delete delivery
        $delivery->delete();

        $this::markDeliveredRequisitions();
        $this::markDeliveredPurchaseOrders();
        $this::markDeliveredReturns();
        $this::markDeliveredReworks();

        return back()->with('success', 'Delivery deleted successfully.');
    }

    public static function markDeliveredRequisitions()
    {
        $requisitions = Requisition::query()
            ->whereIn('status', ['Approved', 'Partially Approved', 'Ordered', 'Delivered'])
            ->with([
                'requisition_items.req_order_items.po_item.purchaseOrder.delivery.deliveryItems',
                'requisition_services.req_order_services.po_service.purchase_order.delivery.delivery_service'
            ])
            ->get();

        foreach ($requisitions as $req) {
            $hasDeliveries = $req->requisition_items->some(function($item) {
                return $item->req_order_items->some(function($roItem) {
                    $po = $roItem->po_item->purchaseOrder ?? null;
                    return $po && $po->delivery->count() > 0;
                });
            });

            if (!$hasDeliveries) {
                $hasDeliveries = $req->requisition_services->some(function($service) {
                    return $service->req_order_services->some(function($roService) {
                        $po = $roService->po_service->purchase_order ?? null;
                        return $po && $po->delivery->count() > 0;
                    });
                });
            }

            $newStatus = $hasDeliveries ? 'Delivered' : 'Ordered';

            if ($req->status !== $newStatus) {
                $req->update(['status' => $newStatus]);
            }
        }
    }

    public static function markDeliveredPurchaseOrders()
    {
        $purchaseOrders = PurchaseOrder::query()
            ->whereIn('status', ['Issued', 'Delivered'])
            ->with([
                'delivery'
            ])
            ->get();

        foreach ($purchaseOrders as $po) {
            // Check if there are any deliveries for this purchase order
            $hasDeliveries = $po->delivery->count() > 0;

            $newStatus = $hasDeliveries ? 'Delivered' : 'Issued';

            if ($po->status !== $newStatus) {
                $po->update(['status' => $newStatus]);
            }
        }
    }

    public static function markDeliveredReturns()
    {
        $returns = Returns::query()
            ->whereIn('status', ['Issued', 'Delivered'])
            ->with([
                'originalDelivery.newDelivery'
            ])
            ->get();

        foreach ($returns as $return) {
            // Check if there's a new delivery created for this return
            $hasNewDelivery = $return->originalDelivery && $return->originalDelivery->new_delivery_id !== null;

            $newStatus = $hasNewDelivery ? 'Delivered' : 'Issued';

            if ($return->status !== $newStatus) {
                $return->update(['status' => $newStatus]);
            }
        }
    }

    public static function markDeliveredReworks()
    {
        $reworks = Rework::query()
            ->whereIn('status', ['Issued', 'Delivered'])
            ->with([
                'originalDelivery.newDelivery'
            ])
            ->get();

        foreach ($reworks as $rework) {
            // Check if there's a new delivery created for this rework
            $hasNewDelivery = $rework->originalDelivery && $rework->originalDelivery->new_delivery_id !== null;

            $newStatus = $hasNewDelivery ? 'Delivered' : 'Issued';

            if ($rework->status !== $newStatus) {
                $rework->update(['status' => $newStatus]);
            }
        }
    }

    private function storeBase64Image(string $base64String, string $directory = 'images'): ?string
    {
        try {
            // Check if string contains base64 data
            if (strpos($base64String, 'data:image') === false) {
                return null;
            }

            // Extract the base64 encoded binary data
            $image_parts = explode(";base64,", $base64String);

            if (count($image_parts) !== 2) {
                return null;
            }

            // Get the image type
            $image_type_aux = explode("image/", $image_parts[0]);
            $image_type = $image_type_aux[1] ?? 'png';

            // Decode the base64 string
            $image_base64 = base64_decode($image_parts[1]);

            // Generate unique filename
            $filename = uniqid() . '_' . time() . '.' . $image_type;
            $filepath = $directory . '/' . $filename;

            // Store the file
            Storage::disk('public')->put($filepath, $image_base64);

            return $filepath;

        } catch (\Exception $e) {
            Log::error('Failed to store base64 image: ' . $e->getMessage());
            return null;
        }
    }
}
