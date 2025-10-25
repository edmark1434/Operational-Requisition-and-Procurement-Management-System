<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    use HasFactory;
    protected $table = 'item';
    protected $fillable = ['barcode','name','dimensions','unit_price','current_stock','make_id','category_id'];
    public $timestamps = false;
}
