<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Permission;
use App\Models\Role;
use App\Models\RolePermission;
use App\Models\Category;
use App\Models\CategorySupplier;
use App\Models\Notification;
use App\Models\Make;
use App\Models\Item;
use App\Models\PurchaseReturn;
use App\Models\Purchase;
use App\Models\Requisition;
use App\Models\PurchaseItem;
use App\Models\ReturnItem;
use App\Models\RequisitionItem;
use App\Models\UserPermission;
use App\Models\Setting;
use App\Models\Supplier;
use App\Models\AuditLog;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory(5)->create();
        Permission::factory(5)->create();
        Role::factory(5)->create();
        Category::factory(5)->create();
        CategorySupplier::factory(5)->create();
        Notification::factory(5)->create();
        Make::factory(5)->create();
        Item::factory(5)->create();
        PurchaseReturn::factory(5)->create();
        Purchase::factory(5)->create();
        Requisition::factory(5)->create();
        PurchaseItem::factory(5)->create();
        ReturnItem::factory(5)->create();
        RequisitionItem::factory(5)->create();
        UserPermission::factory(5)->create();
        Setting::factory(5)->create();
        Supplier::factory(5)->create();
        AuditLog::factory(5)->create();
        RolePermission::factory(5)->create();

    }
}
