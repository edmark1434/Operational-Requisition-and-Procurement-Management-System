<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Requisition extends Model
{
    use HasFactory;
    protected $table = 'requisition';
    protected $fillable = ['status', 'remarks', 'user_id','requestor','notes', 'priority'];
    public $timestamps = true;
    public const STATUS = ['PENDING', 'REJECTED', 'APPROVED', 'DELIVERED', 'RECEIVED'];
}
