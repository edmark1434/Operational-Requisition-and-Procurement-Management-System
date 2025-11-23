<?php

use App\Http\Controllers\Requisition\RequisitionController;
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
use App\Http\Controllers\WebPages\Contacts;
use App\Http\Controllers\WebPages\Services;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard',[Dashboard::class,'index'])->name('dashboard');

// REQUISITION PART
    Route::get('requisitions',[RequisitionController::class,'index'])->name('requisitions');
    //    --------------------------------------------------------------------- REQUISITION FORM
    Route::get('requisitionform',[RequisitionController::class,'requisitionForm'])->name('requisitionform');

    Route::post('requisitionform', [RequisitionController::class, 'store'])->name('requisition.store');

    //    --------------------------------------------------------------------- REQUISITION EDIT
    Route::get('requisitions/{id}/edit',[RequisitionController::class,'requisitionEdit'])->name('requisitionedit');

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

    Route::get('roles',[Roles::class,'index'])->name('roles');

    Route::get('makesandcategories',[MakesAndCategories::class,'index'])->name('makesandcategories');
    Route::get('services',[Services::class,'index'])->name('services');
    Route::get('reworks',[Reworks::class,'index'])->name('reworks');
    Route::get('contacts',[Contacts::class,'index'])->name('contacts');
    Route::get('notifications',[Notifications::class,'index'])->name('notifications');

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
