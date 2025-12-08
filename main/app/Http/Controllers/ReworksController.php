<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Delivery;
use App\Models\Rework;
use App\Models\ReworkService;
use App\Models\ReworkDelivery;
use App\Models\PurchaseOrderDetails;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReworksController extends Controller
{
    // 1. Load the "Add Rework" Page with Deliveries
    public function create()
    {
        // Fetch Deliveries that are 'Received' (and presumably contain services)
        $deliveries = Delivery::where('status', 'Received')
            ->with(['purchaseOrder.vendor'])
            ->orderBy('delivery_date', 'desc')
            ->get()
            ->map(function ($delivery) {
                return [
                    'ID' => $delivery->id,
                    'REFERENCE_NO' => $delivery->ref_no ?? 'DEL-'.$delivery->id,
                    'TYPE' => $delivery->type,
                    'SUPPLIER_NAME' => $delivery->purchaseOrder?->vendor?->name ?? 'Unknown Supplier',
                    'DELIVERY_DATE' => $delivery->delivery_date,
                ];
            });

        return Inertia::render('tabs/13-Reworks/ReworkAdd', [
            'deliveries' => $deliveries, // Pass to Frontend
        ]);
    }

    // 2. API: Get Services associated with a Delivery
    // This assumes: Delivery -> PO -> PO Items (where items are services)
    public function getDeliveryServices($deliveryId)
    {
        // 1. Eager load the Delivery Services and the Master Service details
        // Note: 'delivery_service' matches the function name in your Delivery model
        $delivery = Delivery::with(['delivery_service.service'])
            ->find($deliveryId);

        if (!$delivery) {
            return response()->json([]);
        }

        // 2. Map the actual delivered services
        $services = $delivery->delivery_service->map(function ($ds) {
            return [
                // ID for tracking selection
                'item_id' => $ds->service_id,

                // Get name from master service table (safe navigation in case relation missing)
                'item_name' => $ds->service ? $ds->service->name : 'Service #'.$ds->service_id,

                // Use the rate saved in the delivery record
                'unit_price' => $ds->hourly_rate,

                // Quantity usually 1 for service rework, or use hours if relevant
                'available_quantity' => 1,
            ];
        });

        return response()->json($services);
    }

    // 3. Store the New Rework
    public function store(Request $request)
    {
        // Match validation to the lowercase keys sent by Frontend
        $request->validate([
            'delivery_id' => 'required|exists:delivery,id',
            'remarks' => 'required|string',
            'services' => 'required|array|min:1',
            'services.*.service_id' => 'required',
        ]);

        try {
            DB::beginTransaction();

            // Generate REF No
            $refNo = 'REW-' . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);

            // Create Main Rework
            $rework = Rework::create([
                'ref_no' => $refNo,
                'created_at' => now(),
                'status' => 'Pending',
                'remarks' => $request->remarks,
            ]);

            // Link Delivery
            ReworkDelivery::create([
                'rework_id' => $rework->id,
                'old_delivery_id' => $request->delivery_id,
                'new_delivery_id' => null,
            ]);

            // Link Services
            foreach ($request->services as $s) {
                ReworkService::create([
                    'rework_id' => $rework->id,
                    // Assuming your 'services' are technically 'items' in the DB schema
                    // If you have a strict Service model, change 'item_id' to 'service_id'
                    'service_id' => $s['service_id'],
                //    'item_id' => $s['service_id'],
                ]);
            }

            DB::commit();

            // Redirect back to main list
            return redirect()->route('reworks')->with('success', 'Rework created successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Rework Error: " . $e->getMessage());
            return back()->withErrors(['error' => 'Error creating rework: ' . $e->getMessage()]);
        }
    }
}
