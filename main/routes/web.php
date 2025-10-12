<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('tabs/dashboard');
    })->name('dashboard');
//    --------------------------------------------------------------------- REQUISITION
    Route::get('requisitions', function () {
        return Inertia::render('tabs/req/requisitions');
    })->name('requisitions');
//    --------------------------------------------------------------------- REQUISITION FORM
    Route::get('requisitionform', function () {
        return Inertia::render('tabs/req/RequisitionForm/RequisitionForm');
    })->name('requisitionform');
//    --------------------------------------------------------------------- REQUISITION EDIT
    Route::get('requisitions/{id}/edit', function ($id) {
        return Inertia::render('tabs/req/RequisitionForm/RequisitionEdit', [
            'requisitionId' => (int)$id
        ]);
    })->name('requisitionedit');
//    ---------------------------------------------------------------------
    Route::get('inventory', function () {
        return Inertia::render('tabs/inv/inventory');
    })->name('inventory');

    Route::get('purchases', function () {
        return Inertia::render('tabs/prc/purchases');
    })->name('purchases');

    Route::get('suppliers', function () {
        return Inertia::render('tabs/suppliers');
    })->name('suppliers');

    Route::get('returns', function () {
        return Inertia::render('tabs/returns');
    })->name('returns');

    Route::get('audit', function () {
        return Inertia::render('tabs/audit');
    })->name('audit');

    Route::get('users', function () {
        return Inertia::render('tabs/users');
    })->name('users');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
