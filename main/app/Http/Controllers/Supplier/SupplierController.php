<?php

namespace App\Http\Controllers\Supplier;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\CategoryVendor;
use App\Models\Item;
use App\Models\AuditLog;
use App\Models\Vendor;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class SupplierController extends Controller
{
    protected $base_path = "tabs/05-Suppliers";
    public function index()
    {
        $success = session()->pull('success');
        $message = session()->pull('message');
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
        $categ_ven = CategoryVendor::all()->map(function ($cat) {
            return [
                'ID' => $cat->id,
                'CATEGORY_ID' => $cat->category_id, // Consumables
                'SUPPLIER_ID' => $cat->vendor_id
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
        return Inertia::render($this->base_path .'/Suppliers',[
            'suppliersData' => $vendor,
            'itemsData' => $inventory,
            'categorySuppliersData' => $categ_ven,
            'categoriesData' => $categories,
            'success' => $success,
            'message' => $message
        ]);
    }
    public function store(){
        $categories = Category::where('is_active', true)->get()->map(function ($categ) {
            return [
                "CAT_ID" => $categ->id,
                "NAME" => $categ->name,
                "DESCRIPTION" => $categ->description,
                "TYPE" => $categ->type,
            ];
        });
        return Inertia::render($this->base_path .'/SupplierAdd',[
            'categoriesData' => $categories
        ]);
    }
    public function edit($id){
        $allCateg = CategoryVendor::where('vendor_id', $id)->pluck('category_id');
        session(['oldCateg' => $allCateg->toArray()]);

        $ven= Vendor::findOrFail($id);
               
        $categories = Category::where('is_active', true)->get()->map(function ($categ) {
            return [
                "CAT_ID" => $categ->id,
                "NAME" => $categ->name,
                "DESCRIPTION" => $categ->description,
                "TYPE" => $categ->type,
            ];
        });
        
        return Inertia::render($this->base_path .'/SupplierEdit', [
            'supplierId' => (int)$id,
            'vendor' => [
                'ID' => $ven->id,
                'NAME' => $ven->name,
                'EMAIL' => $ven->email,
                'CONTACT_NUMBER' => $ven->contact_number,
                'ALLOWS_CASH' => $ven->allows_cash,
                'ALLOWS_DISBURSEMENT' => $ven->allows_disbursement,
                'ALLOWS_STORE_CREDIT' => $ven->allows_store_credit,
                'CATEGORIES' => $allCateg->toArray()
            ],
            'categoriesData' => $categories
        ]);
    }
    public function create(Request $request){
        $user = Auth::user();
        $vendor = Vendor::create([
            'name' => $request->input('NAME'),
            'email' => $request->input('EMAIL'),
            'contact_number' => $request->input('CONTACT_NUMBER'),
            'allows_cash' => $request->input('ALLOWS_CASH'),
            'allows_disbursement' => $request->input('ALLOWS_DISBURSEMENT'),
            'allows_store_credit' => $request->input('ALLOWS_STORE_CREDIT')
        ]);

        $category = $request->input('CATEGORIES');
        $insertCateg = [];
        foreach($category as $categ){
            $insertCateg[] = [
                'category_id' => $categ,
                'vendor_id' => $vendor->id
            ];
        }
        if(!empty($insertCateg)){
            DB::table('category_vendor')->insert($insertCateg);
        }
         AuditLog::create(attributes: [
                'description' => "Created vendor ".$request->input('NAME')." by ". $user->fullname,
                'user_id' => $user->id,
                'type_id' => 28
            ]);
        return redirect()->route('suppliers')->with([
            'success' => true,
            'message' => 'Vendor created successfully'
        ]);

    }
    public function update(Request $request,$id){
        $user = Auth::user();
        $old_categ = session()->pull('oldCateg', []);

       $new_categ = $request->input('CATEGORIES', []);


        $removeIds = array_diff($old_categ, $new_categ);
        $addedIds = array_diff($new_categ, $old_categ);

        if(!empty($removeIds)){
            DB::table('category_vendor')->where('vendor_id', $id)
                ->whereIn('category_id', $removeIds)->delete();
        }
        $insertData = [];
        foreach($addedIds as $add){
            $insertData[] = [
                'vendor_id' => $id,
                'category_id' => $add
            ];
        }
        if(!empty($insertData)){
            DB::table('category_vendor')->insert($insertData);
        }

        Vendor::findOrFail($id)->update([
            'name' => $request->input('NAME'),
            'email' => $request->input('EMAIL'),
            'contact_number' => $request->input('CONTACT_NUMBER'),
            'allows_cash' => $request->input('ALLOWS_CASH'),
            'allows_disbursement' => $request->input('ALLOWS_DISBURSEMENT'),
            'allows_store_credit' => $request->input('ALLOWS_STORE_CREDIT')
        ]);
        AuditLog::create( [
                'description' => "Updated vendor ".$request->input('NAME')." by ". $user->fullname,
                'user_id' => $user->id,
                'type_id' => 29
            ]);
        return redirect()->route('suppliers')->with([
            'success' => true,
            'message' => 'Vendor updated successfully'
        ]);

    }   
    public function delete($id){
        $user = Auth::user();
        Vendor::findOrFail($id)->update(['is_active' => false]);
        $vend = Vendor::findOrFail($id);
        AuditLog::create( [
                'description' => "Deleted vendor ".$vend->name." by ". $user->fullname,
                'user_id' => $user->id,
                'type_id' => 30
            ]);
        return redirect()->route('suppliers')->with([
            'success' => true,
            'message' => 'Vendor deleted successfully'
        ]);
    }
    public function deleteModal($id){
        $user = Auth::user();
        Vendor::findOrFail($id)->update(['is_active' => false]);
        $vend = Vendor::findOrFail($id);
        AuditLog::create( [
                'description' => "Deleted vendor ".$vend->name." by ". $user->fullname,
                'user_id' => $user->id,
                'type_id' => 30
            ]);
    }
}
