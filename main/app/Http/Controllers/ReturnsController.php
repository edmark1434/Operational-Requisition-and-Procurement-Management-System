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
        $deliveries = Delivery::where('type', 'Item Purchase')
            ->where('status', 'Received')
            ->with(['purchaseOrder.vendor'])
            ->orderBy('delivery_date', 'desc')
            ->get()
            ->map(function ($delivery) {
                return [
                    'id' => $delivery->id,
                    'reference_no' => $delivery->receipt_no ?? 'DEL-'.$delivery->id,
                    'vendor_name' => $delivery->purchaseOrder->supplier->name ?? 'Unknown Vendor',
                    'delivery_date' => $delivery->delivery_date,
                ];
            });

        // FIX: Added 'tabs/' to match the folder structure in your screenshot
        return Inertia::render('tabs/06-Returns/ReturnAdd', [
            'availableDeliveries' => $deliveries
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
                    'item_name' => $row->item->name ?? 'Unknown Item',
                    'unit_price' => $row->unit_price,
                    // Max returnable quantity is what was delivered
                    'available_quantity' => $row->quantity,
                ];
            });

        return response()->json($items);
    }

    // 3. Store the Return
    public function store(Request $request)
    {
        $request->validate([
            'delivery_id' => 'required|exists:delivery,id',
            'return_date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required',
            'items.*.quantity' => 'required|numeric|min:1',
        ]);

        try {
            DB::beginTransaction();

            $return = Returns::create([
                'delivery_id' => $request->delivery_id,
                'return_date' => $request->return_date,
                'remarks' => $request->remarks,
                'status' => 'Pending',
                'reference_no' => 'RET-' . time(),
            ]);

            // Assuming you have a 'return_item' table/model
            foreach ($request->items as $item) {
                DB::table('return_items')->insert([
                    'return_id' => $return->id,
                    'item_id' => $item['item_id'],
                    'quantity' => $item['quantity'],
                ]);
            }

            DB::commit();
            return redirect()->route('returns')->with('success', 'Return created successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error creating return: ' . $e->getMessage()]);
        }
    }
}
