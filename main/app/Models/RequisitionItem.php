<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequisitionItem extends Model
{
    use HasFactory;
    protected $table = 'requisition_item';
    protected $fillable = ['req_id', 'item_id', 'quantity', 'approved_qty'];
    public $timestamps = false;

    public function requisition(){
        return $this->belongsTo(Requisition::class,'req_id');
    }

    public function item(){
        return $this->belongsTo(Item::class,'item_id');
    }

    public function req_order_items()
    {
        return $this->hasMany(RequisitionOrderItem::class, 'req_item_id');
    }
}
