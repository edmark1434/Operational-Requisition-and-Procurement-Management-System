<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\PurchaseOrder;
class RequisitionOrderService extends Model
{
    use HasFactory;
    protected $table = 'requisition_order_service';

    protected $fillable = [
        'req_service_id', 'po_service_id'
    ];

    public function req_service()
    {
        return $this->belongsTo(RequisitionService::class, 'req_service_id');
    }

    public function po_service()
    {
        return $this->belongsTo(OrderService::class, 'po_service_id');
    }


    public $timestamps = false;
}
