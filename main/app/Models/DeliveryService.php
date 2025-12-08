<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Delivery;
use App\Models\Service;
use App\Models\Item;
class DeliveryService extends Model
{
    /** @use HasFactory<\Database\Factories\DeliverServiceFactory> */
    use HasFactory;
    protected $fillable = ['delivery_id', 'service_id', 'item_id', 'hourly_rate', 'hours'];

    public function delivery(){
        return $this->belongsTo(Delivery::class, 'delivery_id');
    }
    public function service(){
        return $this->belongsTo(Service::class, 'service_id');
    }
    public function item(){
        return $this->belongsTo(Item::class, 'item_id');
    }
    public $timestamps = false;
}
