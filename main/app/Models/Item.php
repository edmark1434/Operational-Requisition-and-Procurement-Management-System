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
    public function delivery(){
        return $this->hasMany(DeliveryItem::class,'item_id');
    }
    public function return_item()
    {
        return $this->hasMany(\App\Models\ReturnItem::class, 'item_id');
    }
    public function requisition_item()
    {
        return $this->hasMany(\App\Models\RequisitionItem::class, 'item_id');
    }
    public function order_item()
    {
        return $this->hasMany(\App\Models\OrderItem::class, 'item_id');
    }
    public function delivery_item()
    {
        return $this->hasMany(\App\Models\DeliveryItem::class, 'item_id');
    }
    public $timestamps = false;
}
