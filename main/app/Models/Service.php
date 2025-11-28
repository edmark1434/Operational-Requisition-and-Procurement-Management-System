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
    /** @use HasFactory<\Database\Factories\ServiceFactory> */
    use HasFactory;
    protected $table = 'services';
    protected $fillable = ['name','description','hourly_rate','vendor_id','is_active','category'];

    public function vendor(){
        $this->belongsTo(Vendor::class, 'vendor_id');
    }
    public function requisition_service(){
        $this->hasMany(RequisitionService::class, 'service_id');
    }
    public function order_service(){
        $this->hasMany(OrderService::class, 'service_id');
    }
    public function delivery_service(){
        $this->hasMany(DeliveryService::class, 'service_id');
    }
    public function rework_service(){
        $this->hasMany(ReworkService::class, 'service_id');
    }
    public $timestamps = false;

}
