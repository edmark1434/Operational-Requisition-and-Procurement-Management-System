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
    /**
     * 1. Load the "Add Return" Page with Available Deliveries
     */
    public function create()
    {
        // Fetch valid deliveries (Item Purchase + Received)
        $deliveries = Delivery::where('type', 'Item Purchase')
            ->where('status', 'Received')
            ->with(['purchaseOrder.vendor', 'deliveryItems'])
            ->orderBy('delivery_date', 'desc')
            ->get()
            ->filter(function ($delivery) {
                // --- FILTER LOGIC START ---

                // 1. Calculate Total Items originally bought
                $totalPurchased = $delivery->deliveryItems->sum('quantity');

                // 2. Calculate Total Items already returned
                $associatedReturnIds = DB::table('return_delivery')
                    ->where('old_delivery_id', $delivery->id)
                    ->pluck('return_id');

                // 3. Calculate Total Returned Quantity
                // We exclude 'Rejected' returns because those items are sent back to us
                // and should be eligible for return again if needed.
                $totalReturned = DB::table('return_item')
                    ->join('returns', 'returns.id', '=', 'return_item.return_id')
                    ->whereIn('return_item.return_id', $associatedReturnIds)
                    ->where('returns.status', '!=', 'Rejected')
                    ->sum('return_item.quantity');

                // 4. Keep delivery ONLY if there are items left to return
                return ($totalPurchased - $totalReturned) > 0;
                // --- FILTER LOGIC END ---
            })
            ->map(function ($delivery) {
                return [
                    'id' => $delivery->id,
                    'reference_no' => $delivery->ref_no ?? 'DEL-'.$delivery->id,
                    'type' => $delivery->type,
                    'supplier_name' => $delivery->purchaseOrder?->vendor?->name ?? 'Unknown Vendor',
                    'delivery_date' => $delivery->delivery_date,
                ];
            })
            ->values();

        return Inertia::render('tabs/06-Returns/ReturnAdd', [
            'availableDeliveriesList' => $deliveries
        ]);
    }

    /**
     * 2. Store the Return
     */
    public function store(Request $request)
    {
        $request->validate([
            'delivery_id' => 'required|exists:delivery,id',
            'remarks' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required',
            'items.*.quantity' => 'required|numeric|min:1',
        ]);

        try {
            DB::beginTransaction();

            $randomNumber = str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
            $refNo = 'RET-' . $randomNumber;

            $return = Returns::create([
                'ref_no' => $refNo,
                'remarks' => $request->remarks,
                'status' => 'Pending',
            ]);

            foreach ($request->items as $item) {
                DB::table('return_item')->insert([
                    'return_id' => $return->id,
                    'item_id' => $item['item_id'],
                    'quantity' => $item['quantity'],
                ]);
            }

            DB::table('return_delivery')->insert([
                'return_id' => $return->id,
                'old_delivery_id' => $request->delivery_id,
                'new_delivery_id' => null,
            ]);

            DB::commit();

            return redirect('/returns')->with('success', 'Return created successfully: ' . $refNo);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error creating return: ' . $e->getMessage()]);
        }
    }

    /**
     * 3. Load the Edit Page
     */
    public function edit($id)
    {
        // 1. Get the Return and its Items
        // Uses the 'items' and 'delivery' relationships defined in your Returns model
        $return = Returns::with(['items.item', 'delivery.purchaseOrder.vendor'])->findOrFail($id);

        // 2. Get the Delivery Items for the delivery associated with this return
        // We reuse getDeliveryItems logic to ensure consistent "Available" math
        // $return->delivery_id works because of the accessor we added to the Model
        $deliveryItemsResponse = $this->getDeliveryItems($return->delivery_id);
        $deliveryItems = $deliveryItemsResponse->getData(); // Extract data from JsonResponse

        // 3. Get list of all deliveries (for the dropdown, strictly to display current selection context)
        $deliveries = Delivery::where('type', 'Item Purchase')
            ->where('status', 'Received')
            ->select('id', 'ref_no', 'delivery_date')
            ->get()
            ->map(function($d) {
                return [
                    'ID' => $d->id,
                    'REFERENCE_NO' => $d->ref_no ?? 'DEL-'.$d->id,
                    'DELIVERY_DATE' => $d->delivery_date,
                    'SUPPLIER_NAME' => $d->purchaseOrder->vendor->name ?? 'Unknown'
                ];
            });

        return Inertia::render('tabs/06-Returns/ReturnEdit', [
            'returnId' => (int)$id,
            'serverReturnData' => $return,       // The actual return record
            'serverDeliveryItems' => $deliveryItems, // The items available in that delivery
            'serverDeliveries' => $deliveries    // The dropdown list
        ]);
    }

    /**
     * 4. Update Status
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string',
        ]);

        $return = Returns::findOrFail($id);
        $return->status = $request->status;
        $return->save();

        return back()->with('success', 'Status updated successfully');
    }

    /**
     * 5. Delete Return
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            // 1. Delete the items first (foreign key cleanup)
            DB::table('return_item')->where('return_id', $id)->delete();

            // 2. Delete the pivot (delivery connection)
            DB::table('return_delivery')->where('return_id', $id)->delete();

            // 3. Delete the return itself
            $return = Returns::findOrFail($id);
            $return->delete();

            DB::commit();

            return redirect()->route('returnsIndex')->with('success', 'Return deleted successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Delete failed: ' . $e->getMessage()]);
        }
    }

    /**
     * API Helper: Fetch Items for a specific Delivery
     */
    public function getDeliveryItems($deliveryId)
    {
        // A. Get original items
        $deliveryItems = DeliveryItem::where('delivery_id', $deliveryId)
            ->with('item')
            ->get();

        // B. Find previous returns for this delivery
        $associatedReturnIds = DB::table('return_delivery')
            ->where('old_delivery_id', $deliveryId)
            ->pluck('return_id');

        // C. Get breakdown of quantities by STATUS
        // We exclude 'Rejected' returns here so they don't count as "Used"
        $statusBreakdown = DB::table('return_item')
            ->join('returns', 'returns.id', '=', 'return_item.return_id')
            ->whereIn('return_item.return_id', $associatedReturnIds)
            ->where('returns.status', '!=', 'Rejected')
            ->select(
                'return_item.item_id',
                'returns.status',
                DB::raw('SUM(return_item.quantity) as qty')
            )
            ->groupBy('return_item.item_id', 'returns.status')
            ->get();

        // D. Calculate remaining balance and attach status info
        $items = $deliveryItems->map(function ($row) use ($statusBreakdown) {

            $itemStats = $statusBreakdown->where('item_id', $row->item_id);

            // Calculate totals based on status
            $qtyPending = $itemStats->where('status', 'Pending')->sum('qty');
            $qtyIssued = $itemStats->where('status', 'Issued')->sum('qty');
            $qtyDelivered = $itemStats->where('status', 'Delivered')->sum('qty');

            // Total "Used" quantity
            $totalUsed = $itemStats->sum('qty');

            // Remaining available to return
            $remaining = max(0, $row->quantity - $totalUsed);

            return [
                'item_id' => $row->item_id,
                'item_name' => $row->item->item_name ?? $row->item->name ?? 'Unknown Item',
                'unit_price' => $row->unit_price,
                'original_quantity' => $row->quantity,
                'available_quantity' => (int)$remaining,
                'qty_pending' => (int)$qtyPending,
                'qty_issued' => (int)$qtyIssued,
                'qty_delivered' => (int)$qtyDelivered,
            ];
        });

        return response()->json($items);
    }
}
