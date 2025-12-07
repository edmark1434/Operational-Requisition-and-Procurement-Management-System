<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\CategoryVendor;
use App\Models\Item;
use App\Models\Permission;
use App\Models\AuditLog;
use App\Models\Vendor;
use App\Models\Make;
use App\Models\UserPermission;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

use Illuminate\Http\Request;

class Inventory extends Controller
{
    protected $base_path = "tabs/03-Inventory";
    public function index()
    {
        $success = session()->pull('success');
        $message = session()->pull('message');
        $inventory = Item::with('make', 'category', 'vendor')->where('is_active',true)->get();
        $mappedInventory = $inventory->map(function ($item) {
            return [
                'ID' => $item->id,

                'BARCODE' => $item->barcode,
                'NAME' => $item->name,
                'DIMENSIONS' => $item->dimensions,
                'UNIT_PRICE' => $item->unit_price,
                'CURRENT_STOCK' => $item->current_stock,

                'MAKE_ID' => $item->make_id,
                'MAKE_NAME' => optional($item->make)->name ?? 'Unknown',

                'CATEGORY_ID' => $item->category_id,
                'CATEGORY' => optional($item->category)->name ?? 'Uncategorized',

                // VENDOR = SUPPLIER
                'SUPPLIER_ID' => $item->vendor_id,
                'SUPPLIER_NAME' => optional($item->vendor)->name ?? 'Unknown Supplier',
                'SUPPLIER_EMAIL' => optional($item->vendor)->email ?? '',
                'SUPPLIER_CONTACT_NUMBER' => optional($item->vendor)->contact_number ?? '',

                'ALLOWS_CASH' => optional($item->vendor)->allows_cash ?? false,
                'ALLOWS_DISBURSEMENT' => optional($item->vendor)->allows_disbursement ?? false,
                'ALLOWS_STORE_CREDIT' => optional($item->vendor)->allows_store_credit ?? false,

            ];
        });
        return Inertia::render($this->base_path . '/Inventory' , [
            'item' => $mappedInventory,
            'success' => $success,
            'message' => $message
        ]);
    }
    public function store(){
        $categories = Category::where('type', 'Items')->where('is_active',true)->get();
        $categorySupplier = CategoryVendor::all()->map(function($categsup){
            return  [
                'ID' => $categsup->id,
                'CATEGORY_ID' => $categsup->category_id,
                'SUPPLIER_ID' => $categsup->vendor_id
            ];
        });
        $categoryOptions = $categories->map(function ($category) {
            return [
                'CAT_ID' => $category->id,
                'NAME' => $category->name,
                'DESCRIPTION' => $category->description,
                'TYPE' => $category->type,
            ];
        });
         $vendor = Vendor::where('is_active', true)->get()->map(function ($ven) {
            return [
                'ID' => $ven->id,
                'NAME' => $ven->name,
                'EMAIL' => $ven->email,
                'CONTACT_NUMBER' => $ven->contact_number,
                'ALLOWS_CASH' => $ven->allows_cash,
                'ALLOWS_DISBURSEMENT' => $ven->allows_disbursement,
                'ALLOWS_STORE_CREDIT' => $ven->allows_store_credit
            ];
        });
        $inventory = Item::where('is_active', true)->get()->map(function ($item) {
             return [
                'ID' => $item->id,
                'BARCODE' => $item->barcode,
                'NAME' => $item->name,
                'DIMENSIONS' => $item->dimensions,
                'UNIT_PRICE' => $item->unit_price,
                'CURRENT_STOCK' => $item->current_stock,
                'MAKE_ID' => $item->make_id,
                'CATEGORY_ID' => $item->category_id,
                'SUPPLIER_ID' => $item->vendor_id,
                
            ];
        });

        $categories = Category::where('is_active', true)->get()->map(function ($categ) {
            return [
                "CAT_ID" => $categ->id,
                "NAME" => $categ->name,
                "DESCRIPTION" => $categ->description,
                "TYPE" => $categ->type,
            ];
        });
        $makes = Make::where('is_active',true)->get();
        return Inertia::render($this->base_path . '/ItemAdd', [
            'CATEGORY_OPTIONS' => $categoryOptions,
            'MAKE_OPTIONS' => $makes,
            'categorySuppliers' => $categorySupplier,
            'SUPPLIER_OPTIONS' => $vendor,
            'itemsData' => $inventory
        ]);
    }
    public function create(Request $request){
        Item::create([
            'barcode' => $request->input('BARCODE'),
            'name' => $request->input('NAME'),
            'dimensions' => $request->input('DIMENSIONS'),
            'unit_price' => $request->input('UNIT_PRICE'),
            'current_stock' => $request->input('CURRENT_STOCK'),
            'category_id' => $request->input('CATEGORY_ID'),
            'make_id' => $request->input('MAKE_ID'),
            'vendor_id' => $request->input('SUPPLIER_ID')        
        ]);
        if($request->input('CURRENT_STOCK') <= 10){
            $perm_id = Permission::where('name', 'View Items')->value('id');
            $users = UserPermission::where('perm_id', $perm_id)->get();
            $insertData = [];
            foreach($users as $user){
                $insertData[] = [
                    'message' => `The item `. $request->input('NAME') . ' has low stocks' ,
                    'is_read' => false,
                    'user_id' => $user->user_id
                ];
            }
            if(!empty($insertData)){
                DB::table('notification')->insert($insertData);
            }
        }
            $user = Auth::user();
            AuditLog::create(attributes: [
                    'description' => "Item created ".  $request->input('NAME'). " by ". $user->fullname,
                    'user_id' => $user->id,
                    'type_id' => 16
                ]);
        return redirect()->route('inventory')->with([
            'success' => true,
            'message' => 'Item added successfully'
        ]);
    }
    public function edit($id){
        $item = Item::with('make', 'category', 'vendor')->where('id',$id)->first();
        $categories = Category::where('type', 'Items')->where('is_active',true)->get();
        $categoryOptions = $categories->map(function ($category) {
            return [
                'CAT_ID' => $category->id,
                'NAME' => $category->name,
                'DESCRIPTION' => $category->description,
                'TYPE' => $category->type,
            ];
        });
        $makes = Make::where('is_active',true)->get();
        return Inertia::render($this->base_path .'/ItemEdit', [
            'itemId' => (int)$id,
            'item' => [
                'ID' => $item->id,
                'BARCODE' => $item->barcode,
                'NAME' => $item->name,
                'DIMENSIONS' => $item->dimensions,
                'UNIT_PRICE' => $item->unit_price,
                'CURRENT_STOCK' => $item->current_stock,

                'MAKE_ID' => $item->make_id,
                'MAKE_NAME' => optional($item->make)->name ?? 'Unknown',

                'CATEGORY_ID' => $item->category_id,
                'CATEGORY' => optional($item->category)->name ?? 'Uncategorized',

                // VENDOR = SUPPLIER
                'SUPPLIER_ID' => $item->vendor_id,
                'SUPPLIER_NAME' => optional($item->vendor)->name ?? 'Unknown Supplier',
                'SUPPLIER_EMAIL' => optional($item->vendor)->email ?? '',
                'SUPPLIER_CONTACT_NUMBER' => optional($item->vendor)->contact_number ?? '',

                'ALLOWS_CASH' => optional($item->vendor)->allows_cash ?? false,
                'ALLOWS_DISBURSEMENT' => optional($item->vendor)->allows_disbursement ?? false,
                'ALLOWS_STORE_CREDIT' => optional($item->vendor)->allows_store_credit ?? false,
            ],
            "CATEGORY_OPTIONS" => $categoryOptions,
            "MAKE_OPTIONS" => $makes
        ]);
    }
    public function update(Request $request,$id){
        Item::findOrFail($id)->update([
            'barcode' => $request->input('BARCODE'),
            'name' => $request->input('NAME'),
            'dimensions' => $request->input('DIMENSIONS'),
            'unit_price' => $request->input('UNIT_PRICE'),
            'current_stock' => $request->input('CURRENT_STOCK'),
            'category_id' => $request->input('CATEGORY_ID'),
            'make_id' => $request->input('MAKE_ID'),
            'vendor_id' => $request->input('SUPPLIER_ID')        
        ]);
        if($request->input('CURRENT_STOCK') < 10){
            $perm_id = Permission::where('name', 'View Items')->value('id');
            $users = UserPermission::where('perm_id', $perm_id)->get();
            $insertData = [];
            foreach($users as $user){
                $insertData[] = [
                    'message' => `The item `. $request->input('NAME') . ' has low stocks',
                    'is_read' => false,
                    'user_id' => $user->user_id
                ];
            }
            $user = Auth::user();
            $item = Item::findOrFail($id);
            AuditLog::create(attributes: [
                    'description' => "Item ". $item->name. " updated by ". $user->fullname,
                    'user_id' => $user->id,
                    'type_id' => 17
                ]);
            if(!empty($insertData)){
                DB::table('notification')->insert($insertData);
            }
        }
        return redirect()->route('inventory')->with([
            'success' => true,
            'message' => 'Item updated successfully'
        ]);
    }
    public function delete($id){
        Item::findOrFail($id)->update(['is_active' => false]);
        $user = Auth::user();
        $item = Item::findOrFail($id);
        AuditLog::create(attributes: [
                'description' => "Item ". $item->name. " deleted by ". $user->fullname,
                'user_id' => $user->id,
                'type_id' => 18
            ]);
        return redirect()->route('inventory')->with([
            'success' => true,
            'message' => 'Item deleted successfully'
        ]);
    }
    public function deleteModal($id){
        $user = Auth::user();
        Item::findOrFail($id)->update(['is_active' => false]);
        $item = Item::findOrFail($id);
        AuditLog::create(attributes: [
                'description' => "Item ". $item->name. " deleted by ". $user->fullname,
                'user_id' => $user->id,
                'type_id' => 18
            ]);
    }
}

