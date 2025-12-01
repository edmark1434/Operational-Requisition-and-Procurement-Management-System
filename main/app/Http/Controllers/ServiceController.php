<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function post(Request $request)
    {
        $validated = $request->validate([
            'NAME' => 'required|string|max:255',
            'DESCRIPTION' => 'required|string',
            'HOURLY_RATE' => 'required|numeric|min:0',
            'CATEGORY' => 'required|exists:category,id',
            'VENDOR_ID' => 'nullable|exists:vendor,id',
        ]);

        $final = [
            'name' => $validated['NAME'],
            'description' => $validated['DESCRIPTION'],
            'hourly_rate' => $validated['HOURLY_RATE'],
            'category_id' => $validated['CATEGORY'],
            'vendor_id' => $validated['VENDOR_ID'] ?? null,
        ];

        Service::query()->create($final);
        AuditLog::query()->create([
            'description' => 'Service created: ' . $final['name'],
            'user_id' => auth()->id(),
            'type_id' => 19,
        ]);

        return back();
    }

    public function put(Request $request, $id)
    {
        $validated = $request->validate([
            'NAME' => 'required|string|max:255',
            'DESCRIPTION' => 'required|string',
            'HOURLY_RATE' => 'required|numeric|min:0',
            'CATEGORY' => 'required|exists:category,id',
            'VENDOR_ID' => 'nullable|exists:vendor,id',
        ]);

        $final = [
            'name' => $validated['NAME'],
            'description' => $validated['DESCRIPTION'],
            'hourly_rate' => $validated['HOURLY_RATE'],
            'category_id' => $validated['CATEGORY'],
            'vendor_id' => $validated['VENDOR_ID'] ?? null,
        ];

        Service::query()->findOrFail($id)->update($final);
        AuditLog::query()->create([
            'description' => 'Details of ' . $final['name'] . ' updated',
            'user_id' => auth()->id(),
            'type_id' => 20,
        ]);

        return back();
    }

    public function delete($id)
    {
        $service = Service::query()->findOrFail($id);
        $service->update(['is_active' => false]);

        AuditLog::query()->create([
            'description' => 'Service deleted: ' . $service->name,
            'user_id' => auth()->id(),
            'type_id' => 21,
        ]);

        return back();
    }
}
