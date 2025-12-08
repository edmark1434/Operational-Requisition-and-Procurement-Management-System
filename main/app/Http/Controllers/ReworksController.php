<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Delivery;
use App\Models\Rework;
use App\Models\ReworkService;
use App\Models\ReworkDelivery;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReworksController extends Controller
{
    // 1. Load the "Add Rework" Page with Deliveries
    public function create()
    {
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
            'deliveries' => $deliveries,
        ]);
    }

    // ... inside ReworksController class ...

    // 4. Delete Rework (Cascading Delete)
// 4. PERMANENTLY DELETE Rework
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            // 1. Get exact table names from Models
            // This ensures we get 'rework_delivery' (singular) instead of guessing plural
            $serviceTable = (new ReworkService())->getTable();   // Likely 'rework_services'
            $deliveryTable = (new ReworkDelivery())->getTable(); // Is 'rework_delivery'

            // 2. DISABLE Foreign Key Checks
            // This allows us to delete the children without the database blocking us
            \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();

            // 3. Delete Child Records using the CORRECT table names
            DB::table($serviceTable)->where('rework_id', $id)->delete();
            DB::table($deliveryTable)->where('rework_id', $id)->delete();

            // 4. Delete Main Rework
            $rework = Rework::find($id);
            if ($rework) {
                $rework->forceDelete();
            }

            // 5. Re-enable Checks
            \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

            DB::commit();

            return redirect()->back()->with('success', 'Rework request deleted successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();
            Log::error("Delete Rework Error: " . $e->getMessage());

            // Return the actual error to the frontend so we can see it if it fails again
            return back()->withErrors(['error' => 'Delete failed: ' . $e->getMessage()]);
        }
    }

    // 2. API: Get Services associated with a Delivery
// In App\Http\Controllers\ReworksController.php

// In App\Http\Controllers\ReworksController.php

    public function getDeliveryServices($deliveryId)
    {
        try {
            // 1. Get Table Names
            $reworkServiceTable = (new ReworkService())->getTable();
            $reworkDeliveryTable = (new ReworkDelivery())->getTable();
            $reworkTable = (new Rework())->getTable();

            // 2. Fetch Existing Reworks
            // We need to verify that we are NOT picking up deleted reworks
            $existingReworks = DB::table($reworkServiceTable)
                ->join($reworkDeliveryTable, "$reworkServiceTable.rework_id", '=', "$reworkDeliveryTable.rework_id")
                ->join($reworkTable, "$reworkServiceTable.rework_id", '=', "$reworkTable.id")
                ->where("$reworkDeliveryTable.old_delivery_id", $deliveryId)

                // --- CRITICAL FIXES START HERE ---

                // 1. Exclude 'Rejected' or 'Cancelled' statuses (Normal logic)
                ->whereNotIn("$reworkTable.status", ['Rejected', 'Cancelled'])

                // 2. EXCLUDE SOFT DELETED RECORDS
                // This tells the query: "Only look at reworks where deleted_at is NULL"
                ->whereNull("$reworkTable.deleted_at")

                // ---------------------------------

                ->select(
                    "$reworkServiceTable.service_id",
                    "$reworkTable.status"
                )
                ->get();

            // 3. Create Map
            $statusMap = $existingReworks->pluck('status', 'service_id')->toArray();

            // 4. Load Delivery
            $delivery = Delivery::with(['delivery_service.service'])->find($deliveryId);

            if (!$delivery) return response()->json([]);

            $deliveryServices = $delivery->delivery_service ?? collect([]);

            // 5. Map Data
            $services = $deliveryServices->map(function ($ds) use ($statusMap) {
                $currentStatus = $statusMap[$ds->service_id] ?? null;

                return [
                    'item_id' => $ds->service_id,
                    'item_name' => $ds->service ? $ds->service->name : 'Service #'.$ds->service_id,
                    'unit_price' => $ds->hourly_rate,
                    'available_quantity' => 1,
                    'rework_status' => $currentStatus,
                ];
            })->values();

            return response()->json($services);

        } catch (\Exception $e) {
            Log::error("Get Services Error: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // 3. Store the New Rework
    public function store(Request $request)
    {
        $request->validate([
            'delivery_id' => 'required|exists:delivery,id',
            'remarks' => 'required|string',
            'services' => 'required|array|min:1',
            'services.*.service_id' => 'required',
        ]);

        try {
            DB::beginTransaction();

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
                    'service_id' => $s['service_id'],
                ]);
            }

            DB::commit();

            return redirect()->route('reworks')->with('success', 'Rework created successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Rework Error: " . $e->getMessage());
            return back()->withErrors(['error' => 'Error creating rework: ' . $e->getMessage()]);
        }
    }
}
