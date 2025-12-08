<?php

namespace App\Http\Controllers\Requisition;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Requisition;
use App\Models\RequisitionItem;
use App\Models\RequisitionService;
use App\Models\Category;
use App\Models\Item;
use App\Models\Notification;
use App\Models\Service;

class RequisitionController extends Controller
{
    protected $base_path = "tabs/02-Requisitions";

    private function getSystemServices()
    {
        return Service::where('is_active', true)
            ->select('id', 'name', 'description', 'hourly_rate', 'vendor_id', 'is_active', 'category_id')
            ->orderBy('name')
            ->get();
    }

    private function getInventoryItems()
    {
        return Item::where('is_active', true)
            ->where('current_stock', '>', 0)
            ->select('id', 'name', 'current_stock', 'unit_price')
            ->orderBy('name')
            ->get();
    }

    public function index()
    {
        $requisitions = Requisition::with([
            'requisition_items.item.category',
            'requisition_services.service',
        ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($req) {

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

                $rawRows = ($req->type === 'Services' || $req->type === 'services')
                    ? $req->requisition_services
                    : $req->requisition_items;

                $itemsList = $rawRows->map(function($row) use ($req) {
                    if ($req->type === 'Items') {
                        return [
                            'id' => $row->id,
                            'name' => $row->item->name ?? 'Unknown Item',
                            'quantity' => $row->quantity,
                            'approved_qty' => $row->approved_qty,
                            'unit_price' => $row->item->unit_price ?? 0,
                            'total_price' => ($row->quantity * ($row->item->unit_price ?? 0)),
                            'category' => $row->item->category->name ?? 'General',
                        ];
                    }
                    else {
                        $service = $row->service;
                        return [
                            'id' => $row->id,
                            'name' => $service->name ?? 'Unknown Service',
                            'quantity' => 1,
                            'approved_qty' => 1,
                            'unit_price' => $service->hourly_rate ?? 0,
                            'total_price' => 1.00,
                            'category' => 'Service',
                            'service_id' => $row->service_id ?? null,
                        ];
                    }
                });

                return [
                    'id' => $req->id,
                    'ref_no' => $req->ref_no,
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
        $serviceCategories = Category::query()
            ->whereRaw('LOWER(type) IN (?, ?, ?)', ['services', 'service', 'Services'])
            ->where('is_active', true)
            ->select('id', 'name')
            ->get();

        $systemServices = $this->getSystemServices();

        $itemCategories = Category::query()
            ->whereRaw('LOWER(type) IN (?, ?, ?)', ['items', 'item', 'Items'])
            ->select('id', 'name')
            ->get();

        $inventoryItems = $this->getInventoryItems();

        return Inertia::render('tabs/02-Requisitions/RequisitionForm/RequisitionForm', [
            'auth' => ['user' => auth()->user()],
            'dbCategories' => $itemCategories,
            'serviceCategories' => $serviceCategories,
            'systemServices' => $systemServices,
            'inventoryItems' => $inventoryItems
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

            $requisition = Requisition::create([
                'user_id' => $request->us_id,
                'requestor' => $request->requestor,
                'priority' => ucfirst($request->priority),
                'type' => ucfirst($request->type),
                'notes' => $request->notes,
                'status' => 'Pending',
                'total_cost' => $request->total_amount,
            ]);

            if ($request->type === 'items') {
                foreach ($request->items as $item) {
                    if (empty($item['itemId'])) continue;

                    $approvedQty = $item['quantity'];

                    $requisition->requisition_items()->create([
                        'item_id' => $item['itemId'],
                        'quantity' => $item['quantity'],
                        'approved_qty' => $approvedQty,
                    ]);
                }
            }
            elseif ($request->type === 'services') {
                foreach ($request->services as $service) {
                    $requisition->requisition_services()->create([
                        'service_id' => $service['serviceId'] ?? null,
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

    // --- FIX APPLIED IN THIS FUNCTION ---
    public function requisitionEdit($id)
    {
        $requisition = Requisition::with([
            'user',
            'requisition_items.item.category',
            'requisition_services.service',
        ])->findOrFail($id);

        // 1. Format Items
        $formattedItems = $requisition->requisition_items->map(function($ri) {
            return [
                'id' => 'existing_' . $ri->id,
                'itemId' => $ri->item_id,
                'category' => $ri->item->category->name ?? 'General',
                'itemName' => $ri->item->name ?? 'Unknown',
                'quantity' => (string)$ri->quantity,
                'unit_price' => (string)($ri->item->unit_price ?? 0),
                'total' => number_format($ri->quantity * ($ri->item->unit_price ?? 0), 2, '.', ''),
                'isSaved' => true,
            ];
        });

        // 2. Format Services (Corrected)
        $formattedServices = $requisition->requisition_services->map(function($rs) {
            $serviceDef = $rs->service;
            return [
                'id' => 'existing_' . $rs->id,
                'serviceId' => (string)($rs->service_id ?? ''),
                // ADDED: Include Category ID so the dropdown knows what to select
                'categoryId' => (string)($serviceDef->category_id ?? ''),
                'serviceName' => $serviceDef->name ?? 'Unknown',
                'description' => $serviceDef->description ?? '',
                'quantity' => "1",
                'itemId' => '',
                'unit_price' => (string)($serviceDef->hourly_rate ?? 0),
                'total' => number_format(1 * ($serviceDef->hourly_rate ?? 0), 2, '.', ''),
                'isSaved' => true,
            ];
        });

        // 3. Fetch Correct Categories (Dynamic based on Type)
        $isServiceReq = in_array(strtolower($requisition->type), ['services', 'service']);

        $categoriesQuery = Category::where('is_active', true)
            ->select('id', 'name')
            ->orderBy('name');

        if ($isServiceReq) {
            // Load Service Categories if this is a Service Requisition
            $categoriesQuery->whereRaw('LOWER(type) IN (?, ?, ?)', ['services', 'service', 'Services']);
        } else {
            // Load Item Categories otherwise
            $categoriesQuery->whereRaw('LOWER(type) IN (?, ?, ?)', ['items', 'item', 'Items']);
        }

        $availableCategories = $categoriesQuery->get();

        $systemServices = $this->getSystemServices();
        $inventoryItems = $this->getInventoryItems();

        return Inertia::render($this->base_path .'/RequisitionMain/RequisitionEdit', [
            'requisitionId' => (int)$id,
            'serverRequisition' => $requisition,
            'initialItems' => $formattedItems,
            'initialServices' => $formattedServices,
            // Send as 'dbCategories' to match Parent Component props
            'dbCategories' => $availableCategories,
            'systemServices' => $systemServices,
            'inventoryItems' => $inventoryItems
        ]);
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

            $requisition->update([
                'user_id' => $request->us_id,
                'requestor' => $request->requestor,
                'priority' => ucfirst($request->priority),
                'type' => ucfirst($request->type),
                'notes' => $request->notes,
                'total_cost' => $request->total_amount,
            ]);

            if ($request->type === 'items') {
                $requisition->requisition_services()->delete();
                $requisition->requisition_items()->delete();

                foreach ($request->items as $item) {
                    if (empty($item['itemId'])) throw new \Exception("Item missing valid ID.");
                    $requisition->requisition_items()->create([
                        'item_id' => $item['itemId'],
                        'quantity' => $item['quantity'],
                        'approved_qty' => 0,
                    ]);
                }
            }
            elseif ($request->type === 'services') {
                $requisition->requisition_items()->delete();
                $requisition->requisition_services()->delete();

                foreach ($request->services as $service) {
                    $requisition->requisition_services()->create([
                        'service_id' => $service['originalServiceId'] ?? $service['serviceId'] ?? null,
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

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string',
            'reason' => 'nullable|string'
        ]);

        // 1. Fetch the requisition (Make sure to verify it exists)
        $requisition = Requisition::findOrFail($id);

        $statusMap = [
            'pending' => 'Pending',
            'approved' => 'Approved',
            'rejected' => 'Rejected',
            'partially_approved' => 'Partially Approved',
            'ordered' => 'Ordered',
            'delivered' => 'Delivered',
            'awaiting_pickup' => 'Awaiting Pickup',
            'received' => 'Received',
            'completed' => 'Completed'
        ];

        $dbStatus = $statusMap[strtolower($request->status)] ?? ucfirst($request->status);
        $updateData = ['status' => $dbStatus];

        if ($request->status === 'rejected' && $request->reason) {
            $updateData['remarks'] = $request->reason;
        }

        // 2. Perform the update
        $requisition->update($updateData);

        // 3. Create Notification Logic
        // We check if the status is one of the target statuses
        $notifyStatuses = ['Approved', 'Rejected', 'Partially Approved'];

        if (in_array($dbStatus, $notifyStatuses)) {

            // Build the message based on status
            $message = "Your requisition ({$requisition->ref_no}) has been {$dbStatus}.";

            if ($dbStatus === 'Rejected') {
                $message .= " Reason: " . ($request->reason ?? 'No reason provided');
            }

            // Create the notification specifically for the Requisition Creator ($requisition->user_id)
            Notification::create([
                'user_id' => $requisition->user_id, // <--- This ensures only the creator sees it
                'message' => $message,
                'is_read' => false,
                'created_at' => now(), // Manually setting time because $timestamps = false in your Model
            ]);
        }

        return redirect()->back()->with('success', 'Status updated successfully.');
    }

    public function adjust($id)
    {
        $requisition = Requisition::with(['requisition_items.item', 'requisition_services.service', 'user'])
            ->findOrFail($id);

        $rawItems = $requisition->type === 'services' || $requisition->type === 'Services'
            ? $requisition->requisition_services
            : $requisition->requisition_items;

        $formattedItems = $rawItems->map(function($row) use ($requisition) {

            if ($requisition->type === 'Items') {
                $name = $row->item->name ?? 'Unknown';
                $price = $row->item->unit_price ?? 0;
                $qty = $row->quantity;
            } else {
                $name = $row->service->name ?? 'Unknown';
                $price = $row->service->hourly_rate ?? 0;
                $qty = 1;
            }

            $calculatedTotal = $qty * $price;

            return [
                'id' => $row->id,
                'name' => $name,
                'category' => 'General',
                'quantity' => $qty,
                'approved_quantity' => $qty,
                'unit_price' => $price,
                'total' => $calculatedTotal,
            ];
        });

        return Inertia::render($this->base_path .'/RequisitionMain/RequisitionAdjust', [
            'requisitionId' => (int)$id,
            'serverRequisition' => $requisition,
            'initialItems' => $formattedItems,
            'auth' => ['user' => auth()->user()]
        ]);
    }

    public function updateAdjust(Request $request, $id)
    {
        $requisition = Requisition::findOrFail($id);

        if ($requisition->type === 'services' || $requisition->type === 'Services') {
            $requisition->update([
                'remarks' => $request->remarks,
                'total_cost' => $request->total_amount,
            ]);
            return redirect()->route('requisitions')->with('success', 'Adjustments saved successfully.');
        }

        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required',
            'items.*.approved_quantity' => 'required|numeric|min:0',
            'remarks' => 'nullable|string',
            'total_amount' => 'required|numeric'
        ]);

        try {
            DB::transaction(function () use ($request, $requisition) {
                $requisition->update([
                    'remarks' => $request->remarks,
                    'total_cost' => $request->total_amount,
                ]);

                foreach ($request->items as $itemData) {
                    RequisitionItem::where('id', $itemData['id'])
                        ->update(['approved_qty' => $itemData['approved_quantity']]);
                }
            });

            return redirect()->route('requisitions')->with('success', 'Adjustments saved successfully.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to save: ' . $e->getMessage()]);
        }
    }

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
    public function updateInventoryStock($id)
    {
        $requisitionItems = RequisitionItem::where('req_id', $id)->get();

        if ($requisitionItems->isEmpty()) {
            return response()->json(["error" => "No items found for this requisition"], 404);
        }

        foreach ($requisitionItems as $reqItem) {

            // Get item model
            $item = Item::find($reqItem->item_id);

            if (!$item) {
                return response()->json(["error" => "Item not found: ID " . $reqItem->item_id], 404);
            }

            // Check stock
            if ($item->current_stock < $reqItem->approved_qty) {
                return response()->json([
                    "error" => "Insufficient stock",
                    "item_id" => $item->id,
                    "current_stock" => $item->current_stock,
                    "requested" => $reqItem->approved_qty
                ], 400);
            }
            if(($item->current_stock - $reqItem->approved_qty) <= 0){
                Notification::create([
                    'user_id' => 1,
                    'message' => "Out of stock for item: " . $item->name,
                    'type' => 'error',
                    'is_read' => false,
                ]);
            }
            // Deduct stock
            $item->current_stock -= $reqItem->approved_qty;
            $item->save();
        }

        return response()->json(["message" => "All inventory stocks updated successfully."], 200);
    }
}
