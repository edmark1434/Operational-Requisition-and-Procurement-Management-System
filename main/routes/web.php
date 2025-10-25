<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\WebPages\Dashboard;
use App\Http\Controllers\WebPages\Auth;
use App\Http\Controllers\WebPages\Inventory;
use App\Http\Controllers\WebPages\Purchasing;
use App\Http\Controllers\WebPages\Requisition;
use App\Http\Controllers\WebPages\Returns;
use App\Http\Controllers\WebPages\Suppliers;
use App\Http\Controllers\WebPages\Users;
use App\Http\Controllers\WebPages\Audit;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard',[Dashboard::class,'index'])->name('dashboard');
//    --------------------------------------------------------------------- REQUISITION
    Route::get('requisitions',[Requisition::class,'index'])->name('requisitions');
//    --------------------------------------------------------------------- REQUISITION FORM
    Route::get('requisitionform',[Requisition::class,'requisitionForm'])->name('requisitionform');
//    --------------------------------------------------------------------- REQUISITION EDIT
    Route::get('requisitions/{id}/edit',[Requisition::class,'requisitionEdit'])->name('requisitionedit');
//    ---------------------------------------------------------------------
    Route::get('inventory',[Inventory::class,'index'])->name('inventory');
        //Inventory - Add Item
    Route::get('inventory/add',[Inventory::class,"store"])->name('inventoryadd');

    //Inventory - Edit item
    Route::get('inventory/{id}/edit',[Inventory::class,"edit"])->name('inventoryedit');

    Route::get('purchases',[Purchasing::class,'index'])->name('purchases');

    Route::get('suppliers',[Suppliers::class,'index'])->name('suppliers');

    Route::get('returns',[Returns::class,'index'])->name('returns');

    Route::get('audit',[Audit::class,'index'])->name('audit');

    Route::get('users',[Users::class,'index'])->name('users');

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
