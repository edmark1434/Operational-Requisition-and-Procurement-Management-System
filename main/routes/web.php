<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

$routes = [
    'r01' => 'tabs/01-Dashboard',
    'r02' => 'tabs/02-Requisitions',
    'r03' => 'tabs/03-Inventory',
    'r04' => 'tabs/04-Purchases',
    'r05' => 'tabs/05-Suppliers',
    'r06' => 'tabs/06-Returns',
    'r07' => 'tabs/07-AuditLogs',
    'r08' => 'tabs/08-Users',
];


Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');


Route::middleware(['auth', 'verified'])->group(function () use ($routes) {
//  ==================================================================================
//  RO1 - DASHBOARD ROUTES

    //Dashboard
    Route::get('dashboard', function () use ($routes) {
        return Inertia::render("{$routes['r01']}/dashboard");
    })->name('dashboard');

//  ==================================================================================
//  RO2 - REQUISITION ROUTES

    //Requisitions
    Route::get('requisitions', function () use ($routes) {
        return Inertia::render("{$routes['r02']}/RequisitionMain/Requisitions");
    })->name('requisitions');

    //Requisition Form
    Route::get('requisitionform', function () use ($routes) {
        return Inertia::render("{$routes['r02']}/RequisitionForm/RequisitionForm");
    })->name('requisitionform');

    //Requisition Edit
    Route::get('requisitions/{id}/edit', function ($id) use ($routes) {
        return Inertia::render("{$routes['r02']}/RequisitionForm/RequisitionEdit", [
            'requisitionId' => (int)$id
        ]);
    })->name('requisitionedit');


//  ==================================================================================
//  R03 - INVENTORY ROUTES

    //Inventory
    Route::get('inventory', function () use ($routes) {
        return Inertia::render("{$routes['r03']}/inventory");
    })->name('inventory');

//  ==================================================================================
//  R04 - PURCHASES ROUTES

    //Purchases
    Route::get('purchases', function () use ($routes) {
        return Inertia::render("{$routes['r04']}/purchases");
    })->name('purchases');

//  ==================================================================================
//  R05 - SUPPLIERS ROUTES

    //Suppliers
    Route::get('suppliers', function () use ($routes) {
        return Inertia::render("{$routes['r05']}/suppliers");
    })->name('suppliers');

//  ==================================================================================
//  R06 - RETURNS ROUTES

    //Returns
    Route::get('returns', function () use ($routes) {
        return Inertia::render("{$routes['r06']}/returns");
    })->name('returns');

//  ==================================================================================
//  R07 - AUDIT LOGS ROUTES

    //Audit
    Route::get('audit', function () use ($routes) {
        return Inertia::render("{$routes['r07']}/audit");
    })->name('audit');

//  ==================================================================================
//  R08 - USERS ROUTES

    //Users
    Route::get('users', function () use ($routes) {
        return Inertia::render("{$routes['r08']}/users");
    })->name('users');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
