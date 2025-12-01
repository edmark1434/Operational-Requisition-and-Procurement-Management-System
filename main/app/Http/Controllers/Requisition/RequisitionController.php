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
            'requisition_services.item'
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

                // Determine which collection to map based on type
                $rawRows = ($req->type === 'Services' || $req->type === 'services')
                    ? $req->requisition_services
                    : $req->requisition_items;

                $itemsList = $rawRows->map(function($row) use ($req) {

                    // Logic for Items
                    if ($req->type === 'Items') {
                        return [
                            'id' => $row->id,
                            'name' => $row->item->name ?? 'Unknown Item',
                            'quantity' => $row->quantity, // Items have quantity
                            'approved_qty' => $row->approved_qty,
                            'unit_price' => $row->item->unit_price ?? 0,
                            'total_price' => ($row->quantity * ($row->item->unit_price ?? 0)),
                            'category' => $row->item->category->name ?? 'General',
                        ];
                    }
                    // Logic for Services
                    else {
                        // FIX: Pull data from the SERVICE RELATIONSHIP, not the pivot table
                        // Since your DB table doesn't have name/qty/price, we assume 1 qty and master price.
                        $service = $row->service;
                        return [
                            'id' => $row->id,
                            'name' => $service->name ?? 'Unknown Service',
                            'quantity' => 1, // Defaulting to 1 since DB doesn't store quantity
                            'approved_qty' => 1,
                            'unit_price' => $service->hourly_rate ?? 0,
                            'total_price' => $service->hourly_rate ?? 0,
                            'category' => 'Service',
                            'service_id' => $row->service_id ?? null,
                            // Pass the linked item object so frontend can access item.item.name
                            'item' => $row->item,
                        ];
                    }
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

                    // FIX START: Ensure approved_qty equals quantity upon creation
                    $approvedQty = $item['quantity']; // Use the requested quantity as the initial approved quantity
                    // FIX END

                    $requisition->requisition_items()->create([
                        'item_id' => $item['itemId'],
                        'quantity' => $item['quantity'],
                        'approved_qty' => $approvedQty, // Use the calculated approved quantity
                    ]);
                }
            }
            elseif ($request->type === 'services') {
                foreach ($request->services as $service) {
                    // FIX: Removed 'service_name', 'quantity', 'unit_price', 'total_price'
                    // because your database table does not support them.
                    $requisition->requisition_services()->create([
                        'service_id' => $service['serviceId'] ?? null,
                        'item_id' => $service['itemId'] ?? null,
                        // Note: Any "Hours" entered by the user are lost here because the DB cannot store them.
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
            'requisition_services.service',
            'requisition_services.item'
        ])->findOrFail($id);

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

        // Format Services
        $formattedServices = $requisition->requisition_services->map(function($rs) {
            $serviceDef = $rs->service;
            return [
                'id' => 'existing_' . $rs->id,
                'serviceId' => (string)($rs->service_id ?? ''),
                'serviceName' => $serviceDef->name ?? 'Unknown',
                'description' => $serviceDef->description ?? '',
                'quantity' => "1", // Default to 1 (DB has no quantity)
                'itemId' => (string)($rs->item_id ?? ''),
                'unit_price' => (string)($serviceDef->hourly_rate ?? 0),
                'total' => number_format(1 * ($serviceDef->hourly_rate ?? 0), 2, '.', ''),
                'isSaved' => true,
            ];
        });

        $dbCategories = Category::where('is_active', true)
            ->where('type', 'Items')
            ->orderBy('name')
            ->select('id', 'name')
            ->get();

        $systemServices = $this->getSystemServices();
        $inventoryItems = $this->getInventoryItems();

        return Inertia::render($this->base_path .'/RequisitionMain/RequisitionEdit', [
            'requisitionId' => (int)$id,
            'serverRequisition' => $requisition,
            'initialItems' => $formattedItems,
            'initialServices' => $formattedServices,
            'dbCategories' => $dbCategories,
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
                    // FIX: STRICT ERD MATCHING
                    $requisition->requisition_services()->create([
                        'service_id' => $service['originalServiceId'] ?? $service['serviceId'] ?? null,
                        'item_id' => $service['itemId'] ?? null,
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

        $requisition->update($updateData);

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
                $qty = 1; // Fallback
            }

            $calculatedTotal = $qty * $price;

            return [
                'id' => $row->id,
                'name' => $name,
                'category' => 'General',
                'quantity' => $qty,
                'approved_quantity' => $qty, // Defaults to 1 for services since we cant track partial approval of time
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

        // Basic validation - Service adjustments are disabled since there is no 'approved_qty' column
        if ($requisition->type === 'services' || $requisition->type === 'Services') {
            // Just update parent remarks/total
            $requisition->update([
                'remarks' => $request->remarks,
                'total_cost' => $request->total_amount,
            ]);
            return redirect()->route('requisitions')->with('success', 'Adjustments saved successfully.');
        }

        // ... Existing item logic ...
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
}
