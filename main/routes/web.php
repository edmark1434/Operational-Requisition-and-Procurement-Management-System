<?php

use App\Http\Controllers\Requisition\RequisitionController;
use App\Http\Controllers\Supplier\SupplierController;
use App\Http\Controllers\WebPages\Audit;
use App\Http\Controllers\WebPages\Dashboard;
use App\Http\Controllers\WebPages\Inventory;
use App\Http\Controllers\WebPages\Purchasing;
use App\Http\Controllers\WebPages\Returns;
use App\Http\Controllers\WebPages\Users;
use App\Http\Controllers\WebPages\Roles;
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

    Route::get('returns',[Returns::class,'index'])->name('returns');

    Route::get('audit',[Audit::class,'index'])->name('audit');

    Route::get('users',[Users::class,'index'])->name('users');
    Route::get('users/add',[Users::class,"store"])->name('useradd');
    Route::get('users/{id}/edit',[Users::class,"edit"])->name('useredit');

    Route::get('roles',[Roles::class,'index'])->name('roles');

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
