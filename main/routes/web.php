<?php

use App\Http\Controllers\DeliveryController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\Requisition\RequisitionController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\Supplier\SupplierController;
use App\Http\Controllers\WebPages\Audit;
use App\Http\Controllers\WebPages\Dashboard;
use App\Http\Controllers\WebPages\Inventory;
use App\Http\Controllers\WebPages\Purchasing;
use App\Http\Controllers\WebPages\Deliveries;
use App\Http\Controllers\WebPages\Returns; // Existing View Controller
use App\Http\Controllers\ReturnsController; // <--- The Logic Controller we just fixed
use App\Http\Controllers\WebPages\Users;
use App\Http\Controllers\WebPages\Roles;
use App\Http\Controllers\WebPages\MakesAndCategories;
use App\Http\Controllers\WebPages\Reworks;
use App\Http\Controllers\WebPages\Notifications;
use App\Http\Controllers\WebPages\Contact;
use App\Http\Controllers\WebPages\Services;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReworksController;

use Inertia\Inertia;
use App\Models\Requisition;

Route::get('/', function () {
    return Inertia::render('welcome', []);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard',[Dashboard::class,'index'])->name('dashboard');

    // --- REQUISITION ROUTES ---
    Route::get('requisitions', [RequisitionController::class, 'index'])->name('requisitions');
    Route::post('/requisitions', [RequisitionController::class, 'store'])->name('requisitions.store');
    Route::get('requisitionform', [RequisitionController::class, 'requisitionForm'])->name('requisitionform');
    Route::post('/requisition/store', [RequisitionController::class, 'store'])->name('requisition.store');
    Route::get('requisitions/{id}/edit', [RequisitionController::class, 'requisitionEdit'])->name('requisitionedit');
    Route::put('/requisitions/{id}', [RequisitionController::class, 'update'])->name('requisitions.update');
    Route::get('requisitions/{id}/adjust', [RequisitionController::class, 'adjust'])->name('requisitions.adjust');
    Route::put('/requisitions/{id}/adjust', [RequisitionController::class, 'updateAdjust'])->name('requisitions.updateAdjust');

    // API Routes for Dropdowns
    Route::get('/requisition/api/categories', [RequisitionController::class, 'getCategories']);
    Route::get('/requisition/api/items/{categoryId}', [RequisitionController::class, 'getItemsByCategory']);

    Route::put('/requisitions/{id}/status', [RequisitionController::class, 'updateStatus']);

    // INVENTORY
    Route::get('inventory',[Inventory::class,'index'])->name('inventory');
    Route::get('inventory/add',[Inventory::class,"store"])->name('inventoryadd');
    Route::post('inventory/add',[Inventory::class,"create"])->name('inventoryCreate');
    Route::get('inventory/{id}/edit',[Inventory::class,"edit"])->name('inventoryedit');
    Route::put('inventory/{id}/edit',[Inventory::class,"update"])->name('inventoryUpdate');
    Route::delete('inventory/{id}/delete',[Inventory::class,"delete"])->name('inventoryDelete');
    Route::delete('inventory/{id}/deleteModal',[Inventory::class,"deleteModal"])->name('inventoryDeleteModal');

    // PURCHASES
    Route::get('purchases',[Purchasing::class,'index'])->name('purchases');
    Route::get('purchases/create',[Purchasing::class,"create"])->name('PurchaseOrderForm');
    Route::get('purchases/{purchaseId}/edit',[Purchasing::class,"edit"])->name('PurchaseOrderEdit');

    Route::post('purchases/add',[PurchaseOrderController::class,"post"])->name('orderpost');
    Route::put('purchases/{id}/edit',[PurchaseOrderController::class,"put"])->name('orderput');
    Route::delete('purchases/{id}/delete',[PurchaseOrderController::class,"delete"])->name('orderdelete');
    Route::put('purchases/{id}/status', [PurchaseOrderController::class, 'updateStatus'])->name('purchases.updateStatus');

    // SUPPLIERS
    Route::get('suppliers',[SupplierController::class,'index'])->name('suppliers');
    Route::get('suppliers/add',[SupplierController::class,"store"])->name('supplieradd');
    Route::get('suppliers/{id}/edit',[SupplierController::class,"edit"])->name('supplieredit');
    Route::post('suppliers/create',[SupplierController::class,"create"])->name('suppliercreate');
    Route::put('suppliers/{id}/editUpdate',[SupplierController::class,"update"])->name('supplierupdate');
    Route::delete('suppliers/{id}/delete',[SupplierController::class,"delete"])->name('supplierdelete');
    Route::delete('suppliers/{id}/delete-modal',[SupplierController::class,"deleteModal"])->name('supplierdeleteModal');

    // DELIVERIES
    Route::get('deliveries',[Deliveries::class,'index'])->name('delivery');
    Route::get('deliveries/add',[Deliveries::class,"store"])->name('deliveryadd');
    Route::get('deliveries/{id}/edit',[Deliveries::class,"edit"])->name('deliveryedit');
    Route::put('deliveries/{id}/editStatus',[Deliveries::class,"updateStatus"])->name('deliveryeditStatus');

    Route::post('deliveries/add',[DeliveryController::class,"post"])->name('deliverypost');
    Route::put('deliveries/{id}/edit',[DeliveryController::class,"put"])->name('deliveryput');
    Route::delete('deliveries/{id}/delete',[DeliveryController::class,"delete"])->name('deliverydelete');

// --- RETURNS SECTION ---

    // 1. Main List Page

    // 1. Main List Page
    Route::get('returns', [Returns::class, 'index'])->name('returnsIndex');

    // 2. Add Return Form
    Route::get('returns/add', [ReturnsController::class, "create"])->name('returnsadd');

    // 3. Store Return (Create)
    Route::post('returns', [ReturnsController::class, "store"])->name('returns.store');

    // 4. Update Status (FIXED)
    // Changed PATCH to PUT and added '/status' to match your Requisitions/Purchases pattern
    Route::put('returns/{id}/status', [ReturnsController::class, "updateStatus"]);
    // 5. Delete Return
    Route::delete('returns/{id}', [ReturnsController::class, "destroy"])->name('returns.destroy');

    // 6. API for Dropdown Items
    Route::get('/api/delivery/{id}/items', [ReturnsController::class, 'getDeliveryItems']);

    // 7. Edit Page (Full View)
    Route::get('returns/{id}/edit', [Returns::class, "edit"])->name('returnsedit');
    // -----------------------

    Route::get('audit',[Audit::class,'index'])->name('audit');

    // USERS
    Route::get('users',[Users::class,'index'])->name('users');
    Route::get('users/add',[Users::class,"store"])->name('useradd');
    Route::get('users/{id}/edit',[Users::class,"edit"])->name('useredit');
    Route::put('/users/{id}/edit/status',[Users::class,"editStatus"])->name('usereditStatus');
    Route::put('/users/{id}/update',[Users::class,"updateUser"])->name('userUpdate');
    Route::post('/users/create',[Users::class,"createUser"])->name('userCreate');
    Route::delete('/users/{id}/delete',[Users::class,"deleteUser"])->name('userDelete');

    // ROLES
    Route::get('roles',[Roles::class,'index'])->name('roles');
    Route::get('roles/add',[Roles::class,"store"])->name('roleadd');
    Route::post('roles/added',[Roles::class,"roleAdd"])->name('roleAdded');
    Route::get('roles/{id}/edit',[Roles::class,"edit"])->name('roleedit');
    Route::put('roles/{id}/update',[Roles::class,"update"])->name('roleUpdate');
    Route::delete('roles/{id}/delete',[Roles::class,"delete"])->name('roleDelete');

    // MAKES & CATEGORIES
    Route::get('makes-categories',[MakesAndCategories::class,'index'])->name('makesandcategories');
    Route::get('makes-categories/category/add',[MakesAndCategories::class,"store_category"])->name('categoryadd');
    Route::post('makes-categories/category/add',[MakesAndCategories::class,"create_category"])->name('categoryCreate');
    Route::get('makes-categories/category/{id}/edit',[MakesAndCategories::class,"edit_category"])->name('categoryedit');
    Route::put('makes-categories/category/{id}/editUpdate',[MakesAndCategories::class,"update_category"])->name('categoryUpdate');
    Route::delete('makes-categories/category/{id}/DeleteCategory',[MakesAndCategories::class,"categDelete"])->name('categoryDelete');
    Route::delete('makes-categories/category/{id}/DeleteModelCategory',[MakesAndCategories::class,"categDeleteModel"])->name('categoryDeleteModel');
    Route::get('makes-categories/make/add',[MakesAndCategories::class,"store_make"])->name('makeadd');
    Route::post('makes-categories/make/add',[MakesAndCategories::class,"create_make"])->name('makeCreate');
    Route::get('makes-categories/make/{id}/edit',[MakesAndCategories::class,"edit_make"])->name('makeedit');
    Route::put('makes-categories/make/{id}/editUpdate',[MakesAndCategories::class,"update_make"])->name('makeUpdate');
    Route::delete('makes-categories/make/{id}/Delete',[MakesAndCategories::class,"delete"])->name('makeDelete');
    Route::delete('makes-categories/make/{id}/DeleteModel',[MakesAndCategories::class,"deleteModel"])->name('makedeleteModel');

    // SERVICES
    Route::get('services',[Services::class,'index'])->name('services');
    Route::get('services/add',[Services::class,"store"])->name('servicesadd');
    Route::get('services/{id}/edit',[Services::class,"edit"])->name('servicesedit');
    Route::post('services/add',[ServiceController::class,"post"])->name('servicepost');
    Route::put('services/{id}/edit',[ServiceController::class,"put"])->name('serviceput');
    Route::delete('services/{id}/delete',[ServiceController::class,"delete"])->name('servicedelete');

    // REWORKS
    Route::get('reworks',[Reworks::class,'index'])->name('reworks');
    Route::get('reworks/add',[Reworks::class,"store"])->name('reworksadd');
    Route::get('reworks/{id}/edit',[Reworks::class,"edit"])->name('reworksedit');
    Route::put('reworks/{id}/editStatus',[Reworks::class,"updateStatus"])->name('reworksUpdateStatus');



// 2. Add Form (Uses Logic Controller)
    Route::get('reworks/add', [ReworksController::class, 'create'])->name('reworks.add');

// 3. Store Action (Uses Logic Controller)
    Route::post('reworks', [ReworksController::class, 'store'])->name('reworks.store');

// 4. API to fetch Services for a specific Delivery (Used by Frontend AJAX)
    Route::get('/api/reworks/delivery/{id}/services', [ReworksController::class, 'getDeliveryServices']);

    // CONTACTS
    Route::get('contacts',[Contact::class,'index'])->name('contacts');
    Route::get('contacts/add',[Contact::class,"store"])->name('contactsadd');
    Route::get('contacts/{id}/edit',[Contact::class,"edit"])->name('contactsedit');
    Route::post('contacts/create',[Contact::class,"create"])->name('contactscreate');
    Route::put('contacts/{id}/update',[Contact::class,"update"])->name('contactsupdate');
    Route::delete('contacts/{id}/delete',[Contact::class,"delete"])->name('contactsdelete');
    Route::delete('contacts/{id}/delete-modal',[Contact::class,"deleteModal"])->name('contactsdeleteModal');

    Route::get('notifications',[Notifications::class,'index'])->name('notifications');
    Route::put('notifications/{id}/read',[Notifications::class,'editIsRead'])->name('notifications.read');
    Route::put('notifications/mark-all-read',[Notifications::class,'markAsAllRead'])->name('notifications.mark-all-read');
});

// --- TEMPORARY FIX ROUTE ---
Route::get('/fix-references', function () {
    $items = Requisition::whereNull('ref_no')->orWhere('ref_no', '')->get();
    foreach ($items as $item) {
        $item->ref_no = 'REQ-' . str_pad($item->id, 6, '0', STR_PAD_LEFT);
        $item->saveQuietly();
    }
    return "SUCCESS: Fixed " . $items->count() . " records.";
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
