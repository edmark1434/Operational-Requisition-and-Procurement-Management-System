<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class requisition extends Model
{
    protected $table = 'requisition';
    protected $fillable = ['status', 'remarks', 'user_id','requestor','notes'];
    public $timestamps = true;
}
