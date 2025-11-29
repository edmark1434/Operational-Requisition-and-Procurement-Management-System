<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Requisition extends Model
{
    use HasFactory;

    protected $table = 'requisition';

    // ADDED 'type' to fillable
    protected $fillable = [
        'status',
        'remarks',
        'user_id',
        'requestor',
        'notes',
        'priority',
        'type',
        'total_cost'
    ];


    public $timestamps = true;

    // Ensure these match your DB Enum values (lowercase vs Title Case)
    // If your DB has 'Pending', keep 'Pending'. If 'pending', change to 'pending'.
    public const TYPES = ['Items','Services'];
    public const STATUS = ['Pending', 'Rejected', 'Approved', 'Partially Approved', 'Ordered','Delivered','Awaiting Pickup', 'Çompleted'];
    public const PRIORITY = ['Low', 'Normal', 'High'];

    public function user(){
        return $this->belongsTo(User::class,'user_id');
    }

    // Suggestion: Standardize naming to requisition_items (plural)
    public function requisition_items(){
        return $this->hasMany(RequisitionItem::class,'req_id');
    }

    public function purchase_orders(){
        return $this->hasMany(PurchaseOrder::class,'req_id');
    }

    public function requisition_services(){
        // FIXED: Added return
        return $this->hasMany(RequisitionService::class, 'req_id');
    }
}
