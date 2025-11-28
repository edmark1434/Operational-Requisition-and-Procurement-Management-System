<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Requisition;
use App\Models\Service;
use App\Models\Item;
class RequisitionService extends Model
{
    /** @use HasFactory<\Database\Factories\RequisitionServiceFactory> */
    use HasFactory;

    public $fillable = ['req_id','service_id','item_id'];

    public function requisition(){
        $this->belongsTo(Requisition::class, 'req_id');
    }
    public function service(){
        $this->belongsTo(Service::class, 'service_id');
    }
    public function item(){
        $this->belongsTo(Item::class, 'item_id');
    }
    public $timestamps = false;
}
