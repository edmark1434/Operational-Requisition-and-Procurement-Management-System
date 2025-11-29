<?php

use App\Http\Controllers\Requisition\RequisitionController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\Supplier\SupplierController;
use App\Http\Controllers\WebPages\Audit;
use App\Http\Controllers\WebPages\Dashboard;
use App\Http\Controllers\WebPages\Inventory;
use App\Http\Controllers\WebPages\Purchasing;
use App\Http\Controllers\WebPages\Deliveries;
use App\Http\Controllers\WebPages\Returns;
use App\Http\Controllers\WebPages\Users;
use App\Http\Controllers\WebPages\Roles;
use App\Http\Controllers\WebPages\MakesAndCategories;
use App\Http\Controllers\WebPages\Reworks;
use App\Http\Controllers\WebPages\Notifications;
use App\Http\Controllers\WebPages\Contact;
use App\Http\Controllers\WebPages\Services;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome', []);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard',[Dashboard::class,'index'])->name('dashboard');

// --- REQUISITION ROUTES ---
    Route::get('requisitions', [RequisitionController::class, 'index'])->name('requisitions');

// KEEP THIS ONE (Standard REST naming):
    Route::post('/requisitions', [RequisitionController::class, 'store'])->name('requisitions.store');

// Form Page
    Route::get('requisitionform', [RequisitionController::class, 'requisitionForm'])->name('requisitionform');

// DELETE OR COMMENT OUT THIS LINE (It is a duplicate):
// Route::post('/requisition/store', [RequisitionController::class, 'store'])->name('requisition.store');
    // Submission (Keep only ONE store route)
    Route::post('/requisition/store', [RequisitionController::class, 'store'])->name('requisition.store');

    // Edit
    Route::get('requisitions/{id}/edit', [RequisitionController::class, 'requisitionEdit'])->name('requisitionedit');

    // API Routes for Dropdowns
    Route::get('/requisition/api/categories', [RequisitionController::class, 'getCategories']);
    Route::get('/requisition/api/items/{categoryId}', [RequisitionController::class, 'getItemsByCategory']);

    // INVENTORY PART (Main / Add / Edit)
    Route::get('inventory',[Inventory::class,'index'])->name('inventory');
    Route::get('inventory/add',[Inventory::class,"store"])->name('inventoryadd');
    Route::get('inventory/{id}/edit',[Inventory::class,"edit"])->name('inventoryedit');

    // PURCHASES PART (Main / Add / Edit)
    Route::get('purchases',[Purchasing::class,'index'])->name('purchases');
    Route::get('purchases/create',[Purchasing::class,"create"])->name('PurchaseOrderForm');
    Route::get('purchases/{purchaseId}/edit',[Purchasing::class,"edit"])->name('PurchaseOrderEdit');

    Route::get('suppliers',[SupplierController::class,'index'])->name('suppliers');
    Route::get('suppliers/add',[SupplierController::class,"store"])->name('supplieradd');
    Route::get('suppliers/{id}/edit',[SupplierController::class,"edit"])->name('supplieredit');

    Route::get('deliveries',[Deliveries::class,'index'])->name('delivery');
    Route::get('deliveries/add',[Deliveries::class,"store"])->name('deliveryadd');
    Route::get('deliveries/{id}/edit',[Deliveries::class,"edit"])->name('deliveryedit');

    Route::get('returns',[Returns::class,'index'])->name('returns');
    Route::get('returns/add',[Returns::class,"store"])->name('returnsadd');
    Route::get('returns/{id}/edit',[Returns::class,"edit"])->name('returnsedit');

    Route::get('audit',[Audit::class,'index'])->name('audit');

    Route::get('users',[Users::class,'index'])->name('users');
    Route::get('users/add',[Users::class,"store"])->name('useradd');
    Route::get('users/{id}/edit',[Users::class,"edit"])->name('useredit');
    Route::put('/users/${id}/edit/status',[Users::class,"editStatus"])->name('usereditStatus');
    Route::put('/users/${id}/update',[Users::class,"updateUser"])->name('userUpdate');
    Route::post('/users/create',[Users::class,"createUser"])->name('userCreate');
    Route::delete('/users/${id}/delete',[Users::class,"deleteUser"])->name('userDelete');

    Route::get('roles',[Roles::class,'index'])->name('roles');
    Route::get('roles/add',[Roles::class,"store"])->name('roleadd');
    Route::post('roles/added',[Roles::class,"roleAdd"])->name('roleAdded');
    Route::get('roles/{id}/edit',[Roles::class,"edit"])->name('roleedit');
    Route::put('roles/{id}/update',[Roles::class,"update"])->name('roleUpdate');
    Route::delete('roles/{id}/delete',[Roles::class,"delete"])->name('roleDelete');

    Route::get('makes-categories',[MakesAndCategories::class,'index'])->name('makesandcategories');
    Route::get('makes-categories/category/add',[MakesAndCategories::class,"store_category"])->name('categoryadd');
    Route::get('makes-categories/category/{id}/edit',[MakesAndCategories::class,"edit_category"])->name('categoryedit');
    Route::get('makes-categories/make/add',[MakesAndCategories::class,"store_make"])->name('makeadd');
    Route::get('makes-categories/make/{id}/edit',[MakesAndCategories::class,"edit_make"])->name('makeedit');

    Route::get('services',[Services::class,'index'])->name('services');
    Route::get('services/add',[Services::class,"store"])->name('servicesadd');
    Route::get('services/{id}/edit',[Services::class,"edit"])->name('servicesedit');

    Route::post('services/add',[ServiceController::class,"post"])->name('servicepost');
    Route::put('services/{id}/edit',[ServiceController::class,"put"])->name('serviceput');
    Route::delete('services/{id}/delete',[ServiceController::class,"delete"])->name('servicedelete');

    Route::get('reworks',[Reworks::class,'index'])->name('reworks');
    Route::get('reworks/add',[Reworks::class,"store"])->name('reworksadd');
    Route::get('reworks/{id}/edit',[Reworks::class,"edit"])->name('reworksedit');

    Route::get('contacts',[Contact::class,'index'])->name('contacts');
    Route::get('contacts/add',[Contact::class,"store"])->name('contactsadd');
    Route::get('contacts/{id}/edit',[Contact::class,"edit"])->name('contactsedit');

    Route::get('notifications',[Notifications::class,'index'])->name('notifications');

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
