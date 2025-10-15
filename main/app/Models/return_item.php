<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class return_item extends Model
{
    protected $table = 'return_item';
    protected $fillable = ['req_id', 'item_id', 'quantity'];
    public $timestamps = false;
}
