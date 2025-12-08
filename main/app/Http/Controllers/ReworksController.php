<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Delivery;
use App\Models\Rework;
use App\Models\ReworkService;
use App\Models\ReworkDelivery;
use App\Models\AuditLog; // <--- ADDED IMPORT
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

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

    // 2. API: Get Services associated with a Delivery
    public function getDeliveryServices($deliveryId)
    {
        try {
            // 1. Get Table Names Safely
            $reworkServiceTable = (new ReworkService())->getTable();
            $reworkDeliveryTable = (new ReworkDelivery())->getTable();
            $reworkTable = (new Rework())->getTable();

            // 2. Fetch Services that are currently in an ACTIVE Rework
            $existingReworks = DB::table($reworkServiceTable)
                ->join($reworkDeliveryTable, "$reworkServiceTable.rework_id", '=', "$reworkDeliveryTable.rework_id")
                ->join($reworkTable, "$reworkServiceTable.rework_id", '=', "$reworkTable.id")
                ->where("$reworkDeliveryTable.old_delivery_id", $deliveryId)
                ->whereNotIn("$reworkTable.status", ['Rejected', 'Cancelled'])
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

            // --- AUDIT LOG ADDED (Type 12: Rework Created) ---
            AuditLog::query()->create([
                'description' => 'Rework created: ' . $refNo,
                'user_id' => auth()->id(),
                'type_id' => 12,
            ]);
            // -------------------------------------------------

            DB::commit();

            return redirect()->route('reworks')->with('success', 'Rework created successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Rework Error: " . $e->getMessage());
            return back()->withErrors(['error' => 'Error creating rework: ' . $e->getMessage()]);
        }
    }

    // 4. Update Status (Handles Issued/Rejected Logs)
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string',
        ]);

        $rework = Rework::findOrFail($id);
        $rework->status = $request->status;
        $rework->save();

        // --- AUDIT LOG ADDED (Types 13 & 14) ---
        $typeId = null;

        if ($request->status === 'Issued') {
            $typeId = 13; // Rework Issued
        } elseif ($request->status === 'Rejected') {
            $typeId = 14; // Rework Rejected
        }

        if ($typeId) {
            AuditLog::query()->create([
                'description' => 'Rework ' . strtolower($request->status) . ': ' . $rework->ref_no,
                'user_id' => auth()->id(),
                'type_id' => $typeId,
            ]);
        }
        // ---------------------------------------

        return back()->with('success', 'Status updated successfully');
    }

    // 5. Delete Rework (Cascading Delete)
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            // 1. Get exact table names from Models
            $serviceTable = (new ReworkService())->getTable();
            $deliveryTable = (new ReworkDelivery())->getTable();

            // 2. DISABLE Foreign Key Checks
            Schema::disableForeignKeyConstraints();

            // 3. Delete Child Records using the CORRECT table names
            DB::table($serviceTable)->where('rework_id', $id)->delete();
            DB::table($deliveryTable)->where('rework_id', $id)->delete();

            // 4. Delete Main Rework
            $rework = Rework::find($id);
            if ($rework) {
                $rework->forceDelete();
            }

            // 5. Re-enable Checks
            Schema::enableForeignKeyConstraints();

            DB::commit();

            return redirect()->back()->with('success', 'Rework request deleted successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            Schema::enableForeignKeyConstraints();
            Log::error("Delete Rework Error: " . $e->getMessage());

            return back()->withErrors(['error' => 'Delete failed: ' . $e->getMessage()]);
        }
    }
}
