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

    public function linksFrom()
    {
        return $this->hasMany(\App\Models\OrderLink::class, 'po_from_id');
    }

    public function linksTo()
    {
        return $this->hasMany(\App\Models\OrderLink::class, 'po_to_id');
    }

    public function delivery()
    {
        return $this->hasMany(\App\Models\Delivery::class, 'po_id');
    }
    public function deliveryItem()
    {
        return $this->hasMany(\App\Models\DeliveryItem::class, 'po_id');
    }
}
