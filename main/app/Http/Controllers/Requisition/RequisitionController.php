<?php

namespace App\Http\Controllers\Requisition;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Requisition;
use App\Models\RequisitionItem;
use App\Models\Category;
use App\Models\Item;

class RequisitionController extends Controller
{
    protected $base_path = "tabs/02-Requisitions";

    // App/Http/Controllers/RequisitionController.php

    public function index()
    {
        $requisitions = Requisition::with(['requisition_items.item.category'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($req) {

                // 1. Build Category List (Same as before)
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

                // 2. Build Clean Items List (NEW PART - ADD THIS!)
                $itemsList = $req->requisition_items->map(function($item) {
                    return [
                        'id' => $item->id,
                        // Use item name if it exists, otherwise fall back to service name or "Unknown"
                        'name' => $item->item->name ?? $item->item_name ?? $item->service_name ?? 'Unknown Item',
                        'quantity' => $item->quantity,
                        'unit_price' => $item->unit_price ?? 0,
                        'total_price' => $item->total_price ?? 0,
                        'category' => $item->item->category->name ?? $item->category ?? 'General',
                    ];
                });

                return [
                    'id' => $req->id,
                    'requestor' => $req->requestor,
                    'priority' => $req->priority,
                    'type' => $req->type,
                    'status' => $req->status,
                    'notes' => $req->notes,
                    'remarks' => $req->remarks,
                    'created_at' => $req->created_at,
                    'total_cost' => $req->total_cost,
                    'categories' => $categoryList,
                    'items' => $itemsList, // <--- SEND THIS TO REACT
                ];
            });

        return Inertia::render($this->base_path .'/RequisitionMain/Requisitions', [
            'requisitions' => $requisitions
        ]);
    }

    public function requisitionForm()
    {
        return Inertia::render($this->base_path .'/RequisitionForm/RequisitionForm');
    }

    public function requisitionEdit($id)
    {
        return Inertia::render($this->base_path .'/RequisitionForm/RequisitionEdit', [
            'requisitionId' => (int)$id
        ]);
    }

    // --- API Methods ---

    public function getCategories()
    {
        $categories = Category::where('is_active', true) // <--- ADDED THIS CHECK
        ->has('items') // (This keeps your rule that it must have items)
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

    // --- Store Logic ---

// App/Http/Controllers/RequisitionController.php

    public function store(Request $request)
    {
        // 1. Validate
        $validated = $request->validate([
            'requestor' => 'required|string',
            'priority' => 'required|string',
            'type' => 'required|in:items,services',
            'total_amount' => 'required|numeric', // React still sends this as 'total_amount'
            'us_id' => 'required',
            'items' => 'required_if:type,items|array',
            'services' => 'required_if:type,services|array',
        ]);

        try {
            DB::beginTransaction();

            // 2. Create Parent (Using 'total_cost' now!)
            $requisition = Requisition::create([
                'user_id' => $request->us_id,
                'requestor' => $request->requestor,
                'priority' => ucfirst($request->priority),
                'type' => ucfirst($request->type),
                'notes' => $request->notes,
                'status' => 'Pending',

                // MAPPING: React sends 'total_amount', we save to 'total_cost'
                'total_cost' => $request->total_amount,
            ]);

            // 3. Create Children (Items)
            if ($request->type === 'items') {
                foreach ($request->items as $item) {
                    // Add this Security Check
                    if (empty($item['itemId'])) {
                        DB::rollBack();
                        return back()->withErrors(['items' => "Error: The item '{$item['itemName']}' was not found in the database. Please select it from the dropdown list."]);
                    }

                    $requisition->requisition_items()->create([
                        'item_id' => $item['itemId'], // This must have a value now
                        'quantity' => $item['quantity'],
                        'approved_qty' => 0,
                    ]);
                }
            }
            // 4. Create Children (Services)
            elseif ($request->type === 'services') {
                foreach ($request->services as $service) {
                    $requisition->requisition_services()->create([
                        'service_id' => $service['serviceId'] ?? null, // If you have a service ID
                        'service_name' => $service['serviceName'],
                        'quantity' => $service['quantity'],
                        // Add other fields if your service table needs them
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
}
