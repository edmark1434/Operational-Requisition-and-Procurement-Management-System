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
    public function purchase_order(){
        return $this->hasMany(\App\Models\PurchaseOrder::class,'supplier_id');
    }
    public function category_supplier(){
        return $this->hasMany(\App\Models\CategorySupplier::class, 'supplier_id');
    }
}
