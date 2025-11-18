<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
class Requisition extends Model
{
    use HasFactory;
    protected $table = 'requisition';
    protected $fillable = ['status', 'remarks', 'user_id','requestor','notes', 'priority'];
    public $timestamps = true;
    public const STATUSES = [
        'Pending',            // requisition is created
        'Rejected',           // after rejection
        'Approved',           // after approval
        'Partially Approved', // approved but PO is edited e.g. 5 instead of 6 items
        'Ordered',            // when PO is issued, skipped when inventory has the items
        'Delivered',          // delivery is created, skipped when inventory has the items
        'Awaiting Pickup',    // items are ready, requestor has to claim
        'Received',           // encoder marks it received
    ];

    public function user(){
        return $this->belongsTo(User::class,'user_id');
    }
    public function requisitionItems(){
        return $this->hasMany(RequisitionItem::class,'req_id');
    }
}
