<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\RequisitionItem;
use App\Models\PurchaseOrder;
use App\Models\RequisitionService;
class Requisition extends Model
{
    use HasFactory;
    protected $table = 'requisition';
    protected $fillable = ['status', 'remarks', 'user_id','requestor','notes', 'priority'];
    public $timestamps = true;
    public const TYPES = ['Items','Services'];
    public const STATUS = ['Pending', 'Rejected', 'Approved', 'Partially Approved', 'Ordered','Delivered','Awaiting Pickup', 'Çompleted'];
    public function user(){
        return $this->belongsTo(User::class,'user_id');
    }
    public function requisition_item(){
        return $this->hasMany(RequisitionItem::class,'req_id');
    }
    public function purchase_order(){
        return $this->hasMany(PurchaseOrder::class,'req_id');
    }
    public function requisition_service(){
        $this->hasMany(RequisitionService::class, 'req_id');
    }
}
