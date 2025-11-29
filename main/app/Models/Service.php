<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Vendor;
use App\Models\RequisitionService;
use App\Models\DeliveryService;
use App\Models\OrderService;
use App\Models\ReworkService;
class Service extends Model
{
    use HasFactory;
    protected $table = 'services';
    protected $fillable = ['name','description','hourly_rate','vendor_id','is_active','category_id'];

    public function vendor(){
        return $this->belongsTo(Vendor::class, 'vendor_id');
    }
    public function category(){
        return $this->belongsTo(Category::class, 'category_id');
    }
    public function requisition_service(){
        return $this->hasMany(RequisitionService::class, 'service_id');
    }
    public function order_service(){
        return $this->hasMany(OrderService::class, 'service_id');
    }
    public function delivery_service(){
        return $this->hasMany(DeliveryService::class, 'service_id');
    }
    public function rework_service(){
        return $this->hasMany(ReworkService::class, 'service_id');
    }
    public $timestamps = false;

}
