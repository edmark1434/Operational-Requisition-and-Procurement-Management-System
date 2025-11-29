<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\PurchaseOrder;
use App\Models\CategoryVendor;

class Vendor extends Model
{
    use HasFactory;
    protected $table = 'vendor';
    protected $fillable = [
        'name',
        'contact_number',
        'allows_cash',
        'allows_disbursement',
        'allows_store_credit',
        'email',
        'is_active'
    ];
    public $timestamps = false;
    public function purchase_order(){
        return $this->hasMany(PurchaseOrder::class,'vendor_id');
    }
    public function category_vendor(){
        return $this->hasMany(CategoryVendor::class, 'vendor_id');
    }
    public function categories()
    {
        return $this->belongsToMany(Category::class, 'category_vendor', 'vendor_id', 'category_id');
    }
}
