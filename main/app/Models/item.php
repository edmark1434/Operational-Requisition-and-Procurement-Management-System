<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class item extends Model
{
    protected $table = 'item';
    protected $fillable = ['barcode','name','dimensions','unit_price','current_stock','make_id','category_id'];
    public $timestamps = false;
}
