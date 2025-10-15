<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class requisition_item extends Model
{
    protected $table = 'requisition_item';
    protected $fillable = ['req_id', 'item_id', 'quantity'];
    public $timestamps = false;
}
