<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use App\Models\VendorContact;
use Illuminate\Http\Request;
use App\Models\AuditLog;
use App\Models\Vendor;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
class Contact extends Controller
{
    protected $base_path = "tabs/14-Contacts";
    public function index()
    {
        $success = session()->pull('success');
        $message = session()->pull('message');
        $contacts = VendorContact::with('vendor')->where('is_active', true)->get()->map(function ($cont) {
            return [
            'ID' => $cont->id,
            'NAME' => $cont->name,
            'POSITION' => $cont->position,
            'EMAIL' => $cont->email,
            'CONTACT_NUMBER' => $cont->contact_number,
            'VENDOR_ID' => $cont->vendor_id,
            'VENDOR_NAME' => $cont->vendor->name,
            'VENDOR_EMAIL' => $cont->vendor->email,
            'IS_ACTIVE' => $cont->is_active,
            'STATUS' => $cont->is_active ? 'active' : 'inactive',
            ];
        });
        return Inertia::render($this->base_path . '/Main',[
            'contactsData' => $contacts,
            'success' => $success,
            'message' => $message
        ]);
    }
    public function store(){
        return Inertia::render($this->base_path .'/ContactAdd');
    }
    public function edit($id){
        $cont = VendorContact::with('vendor')->where('is_active', true)->where('id',$id)->first();
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
        return Inertia::render($this->base_path .'/ContactEdit', [
            'contactId' => (int)$id,
            'contactDetails' => [
                'ID' => $cont->id,
                'NAME' => $cont->name,
                'POSITION' => $cont->position,
                'EMAIL' => $cont->email,
                'CONTACT_NUMBER' => $cont->contact_number,
                'VENDOR_ID' => $cont->vendor_id,
                'VENDOR_NAME' => $cont->vendor->name,
                'VENDOR_EMAIL' => $cont->vendor->email,
                'VENDOR_CONTACT' => $cont->vendor->contact_number,
                'IS_ACTIVE' => $cont->is_active,
                'STATUS' => $cont->is_active ? 'active' : 'inactive',
            ],
            'SUPPLIER_OPTIONS' => $vendor
        ]);
    }
    public function create(Request $request){
        $user = Auth::user();
        VendorContact::create([
            'name' => $request->input('NAME'),
            'position' => $request->input('POSITION'),
            'email' => $request->input('EMAIL'),
            'contact_number' => $request->input('CONTACT_NUMBER'),
            'is_active' => $request->input('IS_ACTIVE'),
            'vendor_id' => $request->input('VENDOR_ID'),
        ]);
        AuditLog::create(attributes: [
                'description' => "Contact created by ". $user->fullname,
                'user_id' => $user->id,
                'type_id' => 31
            ]);
        return redirect()->route('contacts')->with([
            'success' => true,
            'message' => 'Contact created successfully'
        ]);
    }
    public function update(Request $request,$id){
        $user = Auth::user();
        VendorContact::findOrFail($id)->update([
            'name' => $request->input('NAME'),
            'position' => $request->input('POSITION'),
            'email' => $request->input('EMAIL'),
            'contact_number' => $request->input(key: 'CONTACT_NUMBER'),
            'is_active' => $request->input('IS_ACTIVE'),
            'vendor_id' => $request->input('VENDOR_ID'),
        ]);
        AuditLog::create(attributes: [
                'description' => "Contact updated by ". $user->fullname,
                'user_id' => $user->id,
                'type_id' => 32
            ]);
        return redirect()->route('contacts')->with([
            'success' => true,
            'message' => 'Contact updated successfully'
        ]);
    }
    public function delete($id){
        $user = Auth::user();
        VendorContact::findOrFail($id)->update(['is_active' => false]);
        AuditLog::create(attributes: [
                'description' => "Contact deleted by ". $user->fullname,
                'user_id' => $user->id,
                'type_id' => 32
            ]);
        return redirect()->route('contacts')->with([
            'success' => true,
            'message' => 'Contact deleted successfully'
        ]);
    }
    public function deleteModal($id){
        $user = Auth::user();
        VendorContact::findOrFail($id)->update(['is_active' => false]);
        AuditLog::create(attributes: [
                'description' => "Contact deleted by ". $user->fullname,
                'user_id' => $user->id,
                'type_id' => 32
            ]);
    }
}
