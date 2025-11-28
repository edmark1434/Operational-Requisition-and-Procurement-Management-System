<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\PurchaseOrder;
use App\Models\Service;
use App\Models\Item;
class OrderService extends Model
{
    /** @use HasFactory<\Database\Factories\OrderServiceFactory> */
    use HasFactory;
    protected $fillable = ['po_id', 'service_id', 'item_id'];

    public function purchase_order(){
        $this->belongsTo(PurchaseOrder::class, 'po_id');
    }
    public function service(){
        $this->belongsTo(Service::class, 'service_id');
    }
    public function item(){
        $this->belongsTo(Item::class, 'item_id');
    }
    public $timestamps = false;
}
