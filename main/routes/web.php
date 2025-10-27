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
//    ---------------------------------------------------------------------
    Route::get('inventory',[Inventory::class,'index'])->name('inventory');
        //Inventory - Add Item
    Route::get('inventory/add',[Inventory::class,"store"])->name('inventoryadd');


// REQUISITION PART!
    Route::get('requisitions',[RequisitionController::class,'index'])->name('requisitions');

    //    --------------------------------------------------------------------- REQUISITION FORM
    Route::get('requisitionform',[RequisitionController::class,'requisitionForm'])->name('requisitionform');

    Route::post('requisitionform', [RequisitionController::class, 'store'])->name('requisition.store');

    //    --------------------------------------------------------------------- REQUISITION EDIT
    Route::get('requisitions/{id}/edit',[RequisitionController::class,'requisitionEdit'])->name('requisitionedit');



    //Inventory - Edit item
    Route::get('inventory/{id}/edit',[Inventory::class,"edit"])->name('inventoryedit');

    Route::get('purchases',[Purchasing::class,'index'])->name('purchases');

    Route::get('suppliers',[SupplierController::class,'index'])->name('suppliers');

    Route::get('returns',[Returns::class,'index'])->name('returns');

    Route::get('audit',[Audit::class,'index'])->name('audit');

    Route::get('users',[Users::class,'index'])->name('users');
    Route::get('users/add',[Users::class,"store"])->name('useradd');
    Route::get('users/{id}/edit',[Users::class,"edit"])->name('useredit');

    Route::get('roles',[Roles::class,'index'])->name('roles');

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
