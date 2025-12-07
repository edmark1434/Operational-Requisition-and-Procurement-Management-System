<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\PurchaseOrder;
use App\Models\DeliveryItem;
use App\Models\Returns;
use App\Models\DeliveryService;
class Delivery extends Model
{
    use HasFactory;
    protected $table = 'delivery';
    protected $fillable = [
        'ref_no',
        'type',
        'delivery_date',
        'total_cost',
        'receipt_no',
        'receipt_photo',
        'status',
        'remarks',
        'po_id',
    ];
    public const TYPES = ["Item Purchase", "Service Delivery", "Item Return", "Service Rework"];
    public const STATUS = ["Pending","Received"];
    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class,'po_id');
    }
    public function deliveryItems()
    {
        return $this->hasMany(DeliveryItem::class, 'delivery_id');
    }
    public function delivery_service(){
        return $this->hasMany(DeliveryService::class, 'delivery_id');
    }
    public function returns()
    {
        return $this->belongsToMany(Returns::class, 'return_delivery', 'old_delivery_id', 'return_id')
            ->withPivot(['new_delivery_id']);
    }
    public function reworks()
    {
        return $this->belongsToMany(Rework::class, 'rework_delivery', 'old_delivery_id', 'rework_id')
            ->withPivot(['new_delivery_id']);
    }

    // NEW: deliveries created *because of* a return
    public function newDeliveriesFromReturns()
    {
        return $this->belongsToMany(Returns::class, 'return_delivery', 'new_delivery_id', 'return_id');
    }

    // NEW: deliveries created *because of* a rework
    public function newDeliveriesFromReworks()
    {
        return $this->belongsToMany(Rework::class, 'rework_delivery', 'new_delivery_id', 'rework_id');
    }

    public $timestamps = false;
}
