<?php

namespace App\Http\Controllers;

use App\Models\Requisition;
use App\Models\RequisitionItem; // ASSUMING you have this model for line items
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class RequisitionUserController extends Controller
{
    /**
     * Store a newly created requisition in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        // 1. Basic Validation
        $request->validate([
            'requestor' => 'required|string|max:255',
            'priority' => 'required|string|in:normal,high,urgent',
            'notes' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.category' => 'required|string|max:100',
            'items.*.description' => 'required|string|max:255',
        ]);

        // 2. Create the Requisition Header
        $requisition = Requisition::create([
            'user_id' => Auth::id(), // Get the ID of the currently logged-in user
            'requestor' => $request->input('requestor'),
            'priority' => strtoupper($request->input('priority')), // 'normal' -> 'NORMAL'
            'notes' => $request->input('notes'),
            'status' => 'PENDING', // Set default status as per your model constant
        ]);

        // 3. Save the Requisition Line Items
        // This requires a RequisitionItem model and a one-to-many relationship setup.
        foreach ($request->input('items') as $itemData) {
            // Check if RequisitionItem model exists (you might need to create this)
            if (class_exists(RequisitionItem::class)) {
                RequisitionItem::create([
                    'requisition_id' => $requisition->id, // Link to the header
                    'item_id' => $itemData['itemId'],
                    'quantity' => $itemData['quantity'],
                    'category' => $itemData['category'],
                    'description' => $itemData['description'],
                    'unit_price' => $itemData['unit_price']
                    // ... other item fields
                ]);
            } else {
                // Log an error if the model is missing but continue for this example
                \Log::warning('RequisitionItem model is missing. Items were not saved.');
                break;
            }
        }

        // 4. Redirect Back (Inertia success response)
        return redirect()->route('requisition.store') // Or redirect to the index page
        ->with('success', 'Requisition submitted successfully!');
    }
}
