<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\PurchaseOrder;
use App\Models\DeliveryItem;
use App\Models\Returns;
class Delivery extends Model
{
    /** @use HasFactory<\Database\Factories\DeliveryFactory> */
    use HasFactory;
    protected $table = 'delivery';
    protected $fillable = [
        'delivery_date',
        'total_cost',
        'receipt_no',
        'receipt_photo',
        'status',
        'remarks',
        'po_id',
    ];
    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class,'po_id');
    }
    public function deliveryItems()
    {
        return $this->hasMany(DeliveryItem::class, 'delivery_id');
    }
    public function returns(){
        return $this->hasMany(Returns::class,'delivery_id');
    }
    public $timestamps = false;
}
