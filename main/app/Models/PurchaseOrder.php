<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Vendor;
use App\Models\RequisitionOrderItem;
use App\Models\Requisition;
use App\Models\Delivery;
use App\Models\DeliveryItem;
use App\Models\OrderService;
class PurchaseOrder extends Model
{
    use HasFactory;

    protected $table = 'purchase_order';
    protected $primaryKey = 'id';
    public $timestamps = false; // since you DO NOT have updated_at
    public const TYPES = ['Items','Services'];
    /**
     * Available payment types (Your migration uses this)
     */
    public const PAYMENT_TYPE = ['Cash', 'Store Credit', 'Disbursement'];
    public const STATUS = ['Pending','Merged','Issued','Rejected','Cancelled','Delivered','Received'];
    /**
     * Mass assignable fields
     */
    protected $fillable = [
        'type',
        'ref_no',
        'total_cost',
        'payment_type',
        'status',
        'remarks',
        'req_id',
        'vendor_id',
        'created_at'
    ];

    /**
     * Relationships
     */
    public function requisition()
    {
        return $this->belongsTo(Requisition::class, 'req_id');
    }

    public function supplier()
    {
        return $this->belongsTo(Vendor::class, 'vendor_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class, 'po_id');
    }

    public function delivery()
    {
        return $this->hasMany(Delivery::class, 'po_id');
    }
    public function deliveryItem()
    {
        return $this->hasMany(DeliveryItem::class, 'po_id');
    }
    public function order_service(){
        $this->hasMany(OrderService::class, 'po_id');
    }
}
