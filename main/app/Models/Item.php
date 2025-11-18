<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\DeliveryItem;
use App\Models\Category;
use App\Models\Make;
class Item extends Model
{
    use HasFactory;
    protected $table = 'item';
    protected $fillable = ['barcode','name','dimensions','unit_price','current_stock','make_id','category_id'];

    public function make(){
        return $this->belongsTo(Make::class,'make_id');
    }
    public function category(){
        return $this->belongsTo(Category::class,'category_id');
    }
    public function supplier(){
        return $this->belongsTo(Supplier::class,'supplier_id');
    }
    public function returnItems()
    {
        return $this->hasMany(\App\Models\ReturnItem::class, 'item_id');
    }
    public function requisitionItems()
    {
        return $this->hasMany(\App\Models\RequisitionItem::class, 'item_id');
    }
    public function orderItems()
    {
        return $this->hasMany(\App\Models\OrderItem::class, 'item_id');
    }
    public function deliveryItems()
    {
        return $this->hasMany(\App\Models\DeliveryItem::class, 'item_id');
    }
    public $timestamps = false;
}
