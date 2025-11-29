<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\PurchaseOrder;
class RequisitionOrderItem extends Model
{
    use HasFactory;
    protected $table = 'requisition_order_item';

    protected $fillable = [
        'req_item_id', 'po_item_id'
    ];

    public function requisitionItem()
    {
        return $this->belongsTo(RequisitionItem::class, 'req_item_id');
    }

    public function purchaseOrderItem()
    {
        return $this->belongsTo(OrderItem::class, 'po_item_id');
    }


    public $timestamps = false;
}
