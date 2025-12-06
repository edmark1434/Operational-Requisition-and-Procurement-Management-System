<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Delivery;
use App\Models\DeliveryItem;
use App\Models\DeliveryService;
use App\Models\PurchaseOrder;
use App\Models\ReturnDelivery;
use App\Models\Returns;
use App\Models\Rework;
use App\Models\ReworkDelivery;
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
            }
        }
        if (!empty($validated['services'])) {
            foreach ($validated['services'] as $service) {
                DeliveryService::query()->create([
                    'delivery_id' => $deliveryId,
                    'service_id' => $service['service_id'],
                    'hourly_rate' => $service['hourly_rate'],
                    'hours' => $service['hours'] ?? 0,
                ]);
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

        AuditLog::query()->create([
            'description' => 'Delivery recorded: ' . $final['ref_no'],
            'user_id' => auth()->id(),
            'type_id' => 8,
        ]);

        return back();
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
