<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class purchase_item extends Model
{
    protected $table = 'purchase_item';
    protected $fillable = ['purchase_id', 'item_id', 'quantity', 'unit_price'];
    public $timestamps = false;
}
