<?php

namespace App\Http\Controllers\Requisition;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Requisition;
use App\Models\RequisitionItem;
use App\Models\RequisitionService; // Make sure to import this
use App\Models\Category;
use App\Models\Item;

class RequisitionController extends Controller
{
    // This defines where your React files are located
    protected $base_path = "tabs/02-Requisitions";

    public function index()
    {
        // 1. Fetch Requisitions
        $requisitions = Requisition::with(['requisition_items.item.category'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($req) {

                // ... (Category List logic stays the same) ...
                $categoryList = [];
                if ($req->type === 'Items') {
                    $categoryList = $req->requisition_items
                        ->map(fn($ri) => $ri->item->category->name ?? 'Uncategorized')
                        ->unique()
                        ->values()
                        ->toArray();
                } else {
                    $categoryList = ['Services'];
                }

                // --- BUILD ITEMS LIST ---
                $itemsList = $req->requisition_items->map(function($item) {
                    return [
                        'id' => $item->id,
                        'name' => $item->item->name ?? $item->item_name ?? $item->service_name ?? 'Unknown Item',
                        'quantity' => $item->quantity,

                        // 👇 ADD THIS LINE HERE 👇
                        'approved_qty' => $item->approved_qty,

                        'unit_price' => $item->item->unit_price ?? $item->unit_price ?? 0,
                        'total_price' => $item->total_price ?? 0,
                        'category' => $item->item->category->name ?? $item->category ?? 'General',
                    ];
                });

                return [
                    'id' => $req->id,
                    'references_no' => $req->references_no,
                    'requestor' => $req->requestor,
                    'priority' => $req->priority,
                    'type' => $req->type,
                    'status' => $req->status,
                    'notes' => $req->notes,
                    'remarks' => $req->remarks,
                    'created_at' => $req->created_at,
                    'total_cost' => $req->total_cost,
                    'categories' => $categoryList,
                    'items' => $itemsList,
                ];
            });

        // ... rest of the function ...

        // 2. Fetch Categories for Dropdown
        $dbCategories = Category::where('is_active', true)
            ->where('type', 'Items')
            ->orderBy('name')
            ->pluck('name');

        return Inertia::render($this->base_path .'/RequisitionMain/Requisitions', [
            'requisitions' => $requisitions,
            'dbCategories' => $dbCategories
        ]);
    }

    public function requisitionForm()
    {
        $dbCategories = Category::where('is_active', true)
            ->where('type', 'Items')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render($this->base_path .'/RequisitionForm/RequisitionForm', [
            'dbCategories' => $dbCategories
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'requestor' => 'required|string',
            'priority' => 'required|string',
            'type' => 'required|in:items,services',
            'total_amount' => 'required|numeric',
            'us_id' => 'required',
            'items' => 'required_if:type,items|array',
            'services' => 'required_if:type,services|array',
        ]);

        try {
            DB::beginTransaction();

            // Create Parent
            $requisition = Requisition::create([
                'user_id' => $request->us_id,
                'requestor' => $request->requestor,
                'priority' => ucfirst($request->priority),
                'type' => ucfirst($request->type),
                'notes' => $request->notes,
                'status' => 'Pending',
                'total_cost' => $request->total_amount,
            ]);

            // Create Items
            if ($request->type === 'items') {
                foreach ($request->items as $item) {
                    if (empty($item['itemId'])) {
                        DB::rollBack();
                        return back()->withErrors(['items' => "Error: The item '{$item['itemName']}' was not found in the database."]);
                    }

                    $requisition->requisition_items()->create([
                        'item_id' => $item['itemId'],
                        'quantity' => $item['quantity'],
                        'approved_qty' => 0, // Default to 0 until approved
                    ]);
                }
            }
            // Create Services
            elseif ($request->type === 'services') {
                foreach ($request->services as $service) {
                    $requisition->requisition_services()->create([
                        'service_id' => $service['serviceId'] ?? null,
                        'service_name' => $service['serviceName'],
                        'quantity' => $service['quantity'],
                        // Ensure your DB has approved_qty for services if needed
                        'approved_qty' => 0,
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('requisitions')->with('success', 'Requisition created!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'System Error: ' . $e->getMessage()]);
        }
    }

    public function requisitionEdit($id)
    {
        $requisition = Requisition::with([
            'user',
            'requisition_items.item.category',
            'requisition_services'
        ])->findOrFail($id);

        // Format Items
        $formattedItems = $requisition->requisition_items->map(function($ri) {
            return [
                'id' => 'existing_' . $ri->id,
                'itemId' => $ri->item_id,
                'originalItemId' => $ri->item_id,
                'category' => $ri->item->category->name ?? 'General',
                'itemName' => $ri->item->name ?? 'Unknown',
                'quantity' => (string)$ri->quantity,
                'unit_price' => (string)($ri->item->unit_price ?? 0),
                'total' => number_format($ri->quantity * ($ri->item->unit_price ?? 0), 2, '.', ''),
                'isSaved' => true,
            ];
        });

        // Format Services
        $formattedServices = $requisition->requisition_services->map(function($rs) {
            return [
                'id' => 'existing_' . $rs->id,
                'serviceId' => (string)($rs->service_id ?? ''),
                'originalServiceId' => $rs->service_id,
                'serviceName' => $rs->service_name,
                'description' => $rs->description ?? '',
                'quantity' => (string)$rs->quantity,
                'unit_price' => (string)($rs->unit_price ?? 0),
                'total' => number_format($rs->quantity * ($rs->unit_price ?? 0), 2, '.', ''),
                'isSaved' => true,
            ];
        });

        $dbCategories = Category::where('is_active', true)
            ->where('type', 'Items')
            ->orderBy('name')
            ->select('id', 'name')
            ->get();

        return Inertia::render($this->base_path .'/RequisitionMain/RequisitionEdit', [
            'requisitionId' => (int)$id,
            'serverRequisition' => $requisition,
            'initialItems' => $formattedItems,
            'initialServices' => $formattedServices,
            'dbCategories' => $dbCategories,
        ]);
    }

    // In RequisitionController.php

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string',
            'reason' => 'nullable|string'
        ]);

        $requisition = Requisition::findOrFail($id);

        // 1. Map Frontend "slugs" to Database "Proper Case"
        $statusMap = [
            'pending' => 'Pending',
            'approved' => 'Approved',
            'rejected' => 'Rejected', // Or 'Declined' if your DB uses that
            'partially_approved' => 'Partially Approved', // Fixes the underscore issue
            'ordered' => 'Ordered',
            'delivered' => 'Delivered',
            'awaiting_pickup' => 'Awaiting Pickup',
            'received' => 'Received',
            'completed' => 'Completed' // or 'Çompleted' based on your model typo
        ];

        // Get the correct string, or default to simple capitalization if not found
        $dbStatus = $statusMap[strtolower($request->status)] ?? ucfirst($request->status);

        $updateData = ['status' => $dbStatus];

        // If rejected, save the reason
        if ($request->status === 'rejected' && $request->reason) {
            $updateData['remarks'] = $request->reason;
        }

        $requisition->update($updateData);

        return redirect()->back()->with('success', 'Status updated successfully.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'requestor' => 'required|string',
            'priority' => 'required|string',
            'type' => 'required|in:items,services',
            'total_amount' => 'required|numeric',
            'us_id' => 'required',
            'items' => 'required_if:type,items|array',
            'services' => 'required_if:type,services|array',
        ]);

        try {
            DB::beginTransaction();

            $requisition = Requisition::findOrFail($id);

            // Update Parent
            $requisition->update([
                'user_id' => $request->us_id,
                'requestor' => $request->requestor,
                'priority' => ucfirst($request->priority),
                'type' => ucfirst($request->type),
                'notes' => $request->notes,
                'total_cost' => $request->total_amount,
            ]);

            // Sync Items/Services (Delete and Recreate)
            if ($request->type === 'items') {
                $requisition->requisition_services()->delete();
                $requisition->requisition_items()->delete();

                foreach ($request->items as $item) {
                    if (empty($item['itemId'])) throw new \Exception("Item missing valid ID.");

                    $requisition->requisition_items()->create([
                        'item_id' => $item['itemId'],
                        'quantity' => $item['quantity'],
                        'approved_qty' => 0, // Reset approval on edit
                    ]);
                }
            }
            elseif ($request->type === 'services') {
                $requisition->requisition_items()->delete();
                $requisition->requisition_services()->delete();

                foreach ($request->services as $service) {
                    $requisition->requisition_services()->create([
                        'service_id' => $service['originalServiceId'] ?? null,
                        'service_name' => $service['serviceName'],
                        'quantity' => $service['quantity'],
                        'approved_qty' => 0,
                    ]);
                }
            }

            DB::commit();
            return redirect()->route('requisitions')->with('success', 'Requisition updated successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Update Failed: ' . $e->getMessage()]);
        }
    }

    // --- ADJUSTMENT LOGIC (Fixed) ---

    public function adjust($id)
    {
        // 1. Load relationships
        // We ensure we load 'requisition_items.item' so we can get the price from the master list
        $requisition = Requisition::with(['requisition_items.item', 'requisition_services', 'user'])
            ->findOrFail($id);

        // 2. Select Items vs Services
        $rawItems = $requisition->type === 'services'
            ? $requisition->requisition_services
            : $requisition->requisition_items;

        // 3. Format Data
        $formattedItems = $rawItems->map(function($row) {

            // --- NAME LOGIC ---
            $name = 'Unknown Item';
            if ($row->item) {
                $name = $row->item->name;
            } elseif (!empty($row->item_name)) {
                $name = $row->item_name;
            } elseif (!empty($row->service_name)) {
                $name = $row->service_name;
            }

            // --- PRICE LOGIC (The Fix) ---
            // 1. Check if price exists on the specific requisition row
            // 2. If not, check the master Item table ($row->item->unit_price)
            // 3. If neither, default to 0
            $price = $row->unit_price ?? ($row->item->unit_price ?? 0);

            // --- TOTAL LOGIC ---
            // Recalculate total to ensure it's not 0 if the DB total is missing
            $calculatedTotal = $row->quantity * $price;

            return [
                'id' => $row->id,
                'name' => $name,
                'category' => $row->category ?? ($row->item->category->name ?? 'General'),
                'quantity' => $row->quantity,
                'approved_quantity' => $row->approved_qty ?? $row->quantity,
                'unit_price' => $price, // Sending the fixed price
                'total' => $calculatedTotal, // Sending recalculated total
            ];
        });

        // 4. Render
        return Inertia::render($this->base_path .'/RequisitionMain/RequisitionAdjust', [
            'requisitionId' => (int)$id,
            'serverRequisition' => $requisition,
            'initialItems' => $formattedItems,
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    public function updateAdjust(Request $request, $id)
    {
        $requisition = Requisition::findOrFail($id);

        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required',
            'items.*.approved_quantity' => 'required|numeric|min:0',
            'remarks' => 'nullable|string',
            'total_amount' => 'required|numeric'
        ]);

        try {
            DB::transaction(function () use ($request, $requisition) {
                // Update Parent
                $requisition->update([
                    'remarks' => $request->remarks,
                    'total_cost' => $request->total_amount,
                ]);

                // Update Items/Services
                foreach ($request->items as $itemData) {
                    if ($requisition->type === 'services') {
                        RequisitionService::where('id', $itemData['id'])
                            ->update(['approved_qty' => $itemData['approved_quantity']]);
                    } else {
                        RequisitionItem::where('id', $itemData['id'])
                            ->update(['approved_qty' => $itemData['approved_quantity']]);
                    }
                }
            });

            return redirect()->route('requisitions')->with('success', 'Adjustments saved successfully.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to save: ' . $e->getMessage()]);
        }
    }

    // --- API Methods ---

    public function getCategories()
    {
        $categories = Category::where('is_active', true)
            ->has('items')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();
        return response()->json($categories);
    }

    public function getItemsByCategory($categoryId)
    {
        $items = Item::where('category_id', $categoryId)
            ->where('is_active', true)
            ->select('id', 'name', 'unit_price', 'current_stock')
            ->orderBy('name')
            ->get();
        return response()->json($items);
    }
}
