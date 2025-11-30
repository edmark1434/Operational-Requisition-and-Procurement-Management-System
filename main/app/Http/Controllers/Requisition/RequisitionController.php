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

    public function index()
    {
        // 1. Fetch Requisitions
        $requisitions = Requisition::with(['requisition_items.item.category'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($req) {

                // Build Category List
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
        return Inertia::render($this->base_path .'/RequisitionForm/RequisitionForm');
    }

    public function requisitionEdit($id)
    {
        // 1. Fetch the Requisition with all necessary relationships
        $requisition = Requisition::with([
            'user',
            'requisition_items.item.category',
            'requisition_services'
        ])->findOrFail($id);

        // 2. Format Items for the React State
        $formattedItems = $requisition->requisition_items->map(function($ri) {
            return [
                'id' => 'existing_' . $ri->id,
                'itemId' => $ri->item_id,
                'originalItemId' => $ri->item_id,
                'category' => $ri->item->category->name ?? 'General',
                'itemName' => $ri->item->name ?? 'Unknown',
                'quantity' => (string)$ri->quantity,
                // Use item price as fallback if pivot price is missing
                'unit_price' => (string)($ri->item->unit_price ?? 0),
                'total' => number_format($ri->quantity * ($ri->item->unit_price ?? 0), 2, '.', ''),
                'isSaved' => true,
            ];
        });

        // 3. Format Services for the React State
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

        // 4. Send everything to the view
        return Inertia::render($this->base_path .'/RequisitionMain/RequisitionEdit', [
            'requisitionId' => (int)$id,
            'serverRequisition' => $requisition,
            'initialItems' => $formattedItems,
            'initialServices' => $formattedServices,
        ]);
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

    // --- Store Logic ---

    public function store(Request $request)
    {
        // 1. Validate
        $validated = $request->validate([
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

            // 2. Create Parent
            $requisition = Requisition::create([
                'user_id' => $request->us_id,
                'requestor' => $request->requestor,
                'priority' => ucfirst($request->priority),
                'type' => ucfirst($request->type),
                'notes' => $request->notes,
                'status' => 'Pending',
                'total_cost' => $request->total_amount,
            ]);

            // 3. Create Children (Items)
            if ($request->type === 'items') {
                foreach ($request->items as $item) {
                    if (empty($item['itemId'])) {
                        DB::rollBack();
                        return back()->withErrors(['items' => "Error: The item '{$item['itemName']}' was not found in the database. Please select it from the dropdown list."]);
                    }

                    $requisition->requisition_items()->create([
                        'item_id' => $item['itemId'],
                        'quantity' => $item['quantity'],
                        'approved_qty' => 0,
                    ]);
                }
            }
            // 4. Create Children (Services)
            elseif ($request->type === 'services') {
                foreach ($request->services as $service) {
                    $requisition->requisition_services()->create([
                        'service_id' => $service['serviceId'] ?? null,
                        'service_name' => $service['serviceName'],
                        'quantity' => $service['quantity'],
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
