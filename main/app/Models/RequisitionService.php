<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Requisition;
use App\Models\Service;
// Removed: use App\Models\Item;

class RequisitionService extends Model
{
    /** @use HasFactory<\Database\Factories\RequisitionServiceFactory> */
    use HasFactory;

    // item_id removed from fillable
    public $fillable = ['req_id','service_id'];

    public $timestamps = false;

    public function requisition(){
        return $this->belongsTo(Requisition::class, 'req_id');
    }

    public function service(){
        return $this->belongsTo(Service::class, 'service_id');
    }

    public function req_order_services()
    {
        return $this->hasMany(RequisitionOrderService::class, 'req_service_id');
    }
}
