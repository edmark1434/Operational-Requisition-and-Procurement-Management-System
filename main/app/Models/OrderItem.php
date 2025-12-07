<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\PurchaseOrder;
use App\Models\Item;
class OrderItem extends Model
{
    /** @use HasFactory<\Database\Factories\OrderItemFactory> */
    use HasFactory;
    protected $table = 'order_item';
    protected $fillable = [
        'po_id','item_id','quantity'
    ];
    public function purchaseOrder(){
        return $this->belongsTo(PurchaseOrder::class,'po_id');
    }
    public function item(){
        return $this->belongsTo(Item::class,'item_id');
    }

    public $timestamps = false;
}
