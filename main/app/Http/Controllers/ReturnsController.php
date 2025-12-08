<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Delivery;
use App\Models\DeliveryItem;
use App\Models\Returns;
use Illuminate\Support\Facades\DB;

class ReturnsController extends Controller
{
    // 1. Load the "Add Return" Page with Available Deliveries
    public function create()
    {
        // Fetch valid deliveries (Item Purchase + Received)
        // We use safe navigation (?) to prevent crashes if vendor is missing
        $deliveries = Delivery::where('type', 'Item Purchase')
            ->where('status', 'Received')
            ->with(['purchaseOrder.vendor']) // Assuming 'vendor' is the relationship name based on your logs
            ->orderBy('delivery_date', 'desc')
            ->get()
            ->map(function ($delivery) {
                return [
                    'id' => $delivery->id,
                    'reference_no' => $delivery->ref_no ?? 'DEL-'.$delivery->id,
                    'type' => $delivery->type,
                    'supplier_name' => $delivery->purchaseOrder?->vendor?->name ?? 'Unknown Vendor',
                    'delivery_date' => $delivery->delivery_date,
                ];
            });

        // Ensure this path matches your frontend folder structure exactly
        return Inertia::render('tabs/06-Returns/ReturnAdd', [
            'availableDeliveriesList' => $deliveries
        ]);
    }

    // 2. API Endpoint: Fetch Items for a specific Delivery
    public function getDeliveryItems($deliveryId)
    {
        $items = DeliveryItem::where('delivery_id', $deliveryId)
            ->with('item')
            ->get()
            ->map(function ($row) {
                return [
                    'item_id' => $row->item_id,
                    // Handle different naming conventions (item_name vs name)
                    'item_name' => $row->item->item_name ?? $row->item->name ?? 'Unknown Item',
                    'unit_price' => $row->unit_price,
                    'available_quantity' => $row->quantity,
                ];
            });

        return response()->json($items);
    }

    // 3. Store the Return
    public function store(Request $request)
    {
        // 1. Validate the incoming data
        $request->validate([
            'delivery_id' => 'required|exists:delivery,id',
            'remarks' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required',
            'items.*.quantity' => 'required|numeric|min:1',
        ]);

        try {
            DB::beginTransaction();

            // 2. Generate Random REF No (REF-XXXXXX)
            $randomNumber = str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
            $refNo = 'RET-' . $randomNumber;

            // 3. Create the Main Return Record
            $return = Returns::create([
                'ref_no' => $refNo,
                'remarks' => $request->remarks,
                'status' => 'Pending',
            ]);

            // 4. Insert into Return Items Table
            foreach ($request->items as $item) {
                DB::table('return_item')->insert([
                    // Verify your DB table name is 'return_item' or 'return_items'
                    'return_id' => $return->id,
                    'item_id' => $item['item_id'],
                    'quantity' => $item['quantity'],
                ]);
            }

            // 5. Insert into Return Delivery (Pivot) Table
            DB::table('return_delivery')->insert([
                'return_id' => $return->id,
                'old_delivery_id' => $request->delivery_id,
                'new_delivery_id' => null,
            ]);

            DB::commit();

            return redirect()->route('returns')->with('success', 'Return created successfully: ' . $refNo);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error creating return: ' . $e->getMessage()]);
        }
    }
}
