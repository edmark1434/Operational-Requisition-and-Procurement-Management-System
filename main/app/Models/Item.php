<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\DeliveryItem;
use App\Models\Category;
use App\Models\RequisitionService;
use App\Models\DeliveryService;
use App\Models\OrderService;
use App\Models\ReworkService;
use App\Models\OrderItem;
use App\Models\RequisitionItem;
use App\Models\Make;
class Item extends Model
{
    use HasFactory;
    protected $table = 'item';
    protected $fillable = ['barcode','name','dimensions','unit_price','current_stock','make_id','category_id','vendor_id','is_active'];
    
    public function make(){
        return $this->belongsTo(Make::class,'make_id');
    }
    public function category(){
        return $this->belongsTo(Category::class,'category_id');
    }
    public function return_item()
    {
        return $this->hasMany(ReturnItem::class, 'item_id');
    }
    public function requisition_item()
    {
        return $this->hasMany(RequisitionItem::class, 'item_id');
    }
    public function order_item()
    {
        return $this->hasMany(OrderItem::class, 'item_id');
    }
    public function delivery_item()
    {
        return $this->hasMany(DeliveryItem::class, 'item_id');
    }
    public function requisition_service(){
        return $this->hasMany(RequisitionService::class, 'item_id');
    }
    public function order_service(){
        return $this->hasMany(OrderService::class, 'item_id');
    }
    public function delivery_service(){
        return $this->hasMany(DeliveryService::class, 'item_id');
    }
    public function rework_service(){
        return $this->hasMany(ReworkService::class, 'item_id');
    }
    public function vendor(){
        return $this->belongsTo(Vendor::class, 'vendor_id');
    }
    public $timestamps = false;
}
