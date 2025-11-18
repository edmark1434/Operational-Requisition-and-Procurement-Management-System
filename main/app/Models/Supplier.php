<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;
    protected $table = 'supplier';
    protected $fillable = [
        'name',
        'contact_info',
        'allows_cash',
        'allows_disbursement',
        'allows_store_credit',
    ];
    public $timestamps = false;
    public function purchaseOrders(){
        return $this->hasMany(\App\Models\PurchaseOrder::class,'supplier_id');
    }
    public function categorySuppliers(){
        return $this->hasMany(\App\Models\CategorySupplier::class, 'supplier_id');
    }
    public function items(){
        return $this->hasMany(\App\Models\Item::class, 'supplier_id');
    }
}
