<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Service;
use App\Models\Vendor;
use Inertia\Inertia;
class Services extends Controller
{
    protected $base_path = "tabs/12-Services";
    public function index()
    {
        $services = Service::with(['category:id,name', 'vendor:id,name,contact_number,email'])
            ->where('is_active', true)
            ->get()
            ->map(function ($service) {
                return [
                    'id' => $service->id,
                    'name' => $service->name,
                    'description' => $service->description,
                    'hourly_rate' => $service->hourly_rate,
                    'is_active' => $service->is_active,
                    'category_id' => $service->category_id,
                    'vendor_id' => $service->vendor_id,
                    'category' => $service->category?->name,
                    'vendor' => $service->vendor?->name,
                    'vendor_contact_num' => $service->vendor?->contact_number,
                    'vendor_email' => $service->vendor?->email,
                ];
            });

        $categories = Category::query()
            ->where('type', 'Services')
            ->where('is_active', true)
            ->get();

        return Inertia::render($this->base_path . '/Main', [
            'services' => $services,
            'categories' => $categories,
        ]);
    }
    public function store(){
        $categories = Category::query()
            ->where('type', 'Services')
            ->where('is_active', true)
            ->get();

        $vendors = Vendor::query()
            ->whereHas('categories', function ($query) {
                $query->where('type', 'Services');
            })
            ->where('is_active', true)
            ->get();

        return Inertia::render($this->base_path .'/ServiceAdd', [
            'categories' => $categories,
            'vendors' => $vendors,
        ]);
    }
    public function edit($id){
        $service = Service::query()->findOrFail($id);
        $categories = Category::query()
            ->where('type', 'Services')
            ->where('is_active', true)
            ->get();

        $vendors = Vendor::query()
            ->whereHas('categories', function ($query) {
                $query->where('type', 'Services');
            })
            ->where('is_active', true)
            ->get();

        return Inertia::render($this->base_path .'/ServiceEdit', [
            'serviceId' => $id,
            'service' => $service,
            'categories' => $categories,
            'vendors' => $vendors,
        ]);
    }
}
