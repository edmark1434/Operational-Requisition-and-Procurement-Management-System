<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Requisition extends Model
{
    use HasFactory;
    protected $table = 'requisition';
    // Add 'priority' and 'description' to the fillable array
    protected $fillable = ['status', 'remarks', 'user_id','requestor','notes', 'priority', 'description'];
    public $timestamps = true;
    public const STATUS = ['PENDING', 'REJECTED', 'APPROVED', 'DELIVERED', 'RECEIVED'];
}
