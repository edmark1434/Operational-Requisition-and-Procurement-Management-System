<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\PurchaseOrder;
use App\Models\Item;
class DeliveryItem extends Model
{
    /** @use HasFactory<\Database\Factories\DeliveryItemFactory> */
    use HasFactory;
    protected $table = 'delivery_item';
    protected $fillable = [
        'delivery_id',
        'item_id',
        'quantity',
        'unit_price',
    ];
    public function delivery()
    {
        return $this->belongsTo(Delivery::class,'delivery_id');
    }
    public function item()
    {
        return $this->belongsTo(Item::class,'item_id');
    }
    public $timestamps = false;
}
