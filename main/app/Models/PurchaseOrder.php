<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    use HasFactory;

    protected $table = 'purchase_order';
    protected $primaryKey = 'id';
    public $timestamps = false; // since you DO NOT have updated_at

    /**
     * Available payment types (Your migration uses this)
     */
    public const PAYMENT_TYPE = ['CASH', 'STORE CREDIT', 'DISBURSEMENT'];
    public const STATUSES = [
        'Pending',            // automatically when req is approved
        'Merged',             // when merged with other POs
        'Issued',             // when manager sends PO to supplier
        'Rejected',           // when PO is rejected by supplier
        'Delivered',          // when delivery is created
        'Partially Delivered',// when delivery is created, but return is also created
        'Received',           // when encoder marks it received via requisition
    ];

    /**
     * Mass assignable fields
     */
    protected $fillable = [
        'references_no',
        'total_cost',
        'payment_type',
        'status',
        'remarks',
        'req_id',
        'supplier_id',
        'created_at'
    ];

    /**
     * Relationships
     */
    public function requisition()
    {
        return $this->belongsTo(\App\Models\Requisition::class, 'req_id');
    }

    public function supplier()
    {
        return $this->belongsTo(\App\Models\Supplier::class, 'supplier_id');
    }

    public function items()
    {
        return $this->hasMany(\App\Models\OrderItem::class, 'po_id');
    }

    public function fromLinks()
    {
        return $this->hasMany(\App\Models\OrderLink::class, 'po_from_id');
    }

    public function toLinks()
    {
        return $this->hasMany(\App\Models\OrderLink::class, 'po_to_id');
    }

    public function deliveries()
    {
        return $this->hasMany(\App\Models\Delivery::class, 'po_id');
    }
    public function deliveryItems()
    {
        return $this->hasMany(\App\Models\DeliveryItem::class, 'po_id');
    }
}
