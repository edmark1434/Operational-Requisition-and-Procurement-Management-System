<?php

namespace App\Http\Controllers\Requisition;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;

class RequisitionController extends Controller
{
    protected $base_path = "tabs/02-Requisitions"; ## NAA SA resources/pages/tabs/etc
    public function index()
    {
        return Inertia::render($this->base_path .'/RequisitionMain/Requisitions');
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
    public function store(Request $request)
    {
        // 1. Validation
        $request->validate([
            'requestor' => 'required|string|max:255',
            'priority' => 'required|string|in:normal,high,urgent',
            'notes' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.category' => 'required|string|max:100',
            'items.*.description' => 'required|string|max:255',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        // 2. Create the Requisition Header
        $requisition = Requisition::create([
            'user_id' => Auth::id(),
            'requestor' => $request->input('requestor'),
            'remarks' => null, // Assuming remarks is set later
            'notes' => $request->input('notes'),
            'status' => Requisition::STATUS[0], // PENDING (assuming 0 is PENDING)
        ]);

        // 3. Save the Requisition Line Items
        // This part requires a separate RequisitionItem model and database table.
        foreach ($request->input('items') as $itemData) {
            // Check if RequisitionItem model exists before attempting to save
            if (class_exists(RequisitionItem::class)) {
                RequisitionItem::create([
                    // Assuming your line item model has these fields
                    'requisition_id' => $requisition->id,
                    'item_id' => $itemData['itemId'], // Can be null
                    'quantity' => $itemData['quantity'],
                    'category' => $itemData['category'],
                    'description' => $itemData['description'],
                    'unit_price' => $itemData['unit_price']
                ]);
            } else {
                // You MUST create the RequisitionItem model and migration for this to work
                \Log::error('RequisitionItem model is missing. Cannot save line items.');
            }
        }

        // 4. Redirect/Response
        return redirect()->route('requisitions') // Redirect to the main requisitions list
        ->with('success', 'Requisition submitted successfully!');
    }
}
