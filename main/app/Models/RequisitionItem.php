<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Item;
use App\Models\Requisition;
class RequisitionItem extends Model
{
    use HasFactory;
    protected $table = 'requisition_item';
    protected $fillable = ['req_id', 'item_id', 'quantity'];
    public $timestamps = false;
    public function requisition(){
        return $this->belongsTo(Requisition::class,'req_id');
    }
    public function item(){
        return $this->belongsTo(Item::class,'item_id');
    }
}
