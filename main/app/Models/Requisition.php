<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Model\User;
class Requisition extends Model
{
    use HasFactory;
    protected $table = 'requisition';
    protected $fillable = ['status', 'remarks', 'user_id','requestor','notes', 'priority'];
    public $timestamps = true;
    public const STATUS = ['PENDING', 'REJECTED', 'APPROVED', 'DELIVERED', 'RECEIVED'];
    public function user(){
        return $this->belongsTo(User::class,'user_id');
    }
    public function requisition_item(){
        return $this->hasMany(\App\Models\RequisitionItem::class,'req_id');
    }
    public function permission_order(){
        return $this->hasMany(\App\Models\PermissionOrder::class,'req_id');
    }
}
