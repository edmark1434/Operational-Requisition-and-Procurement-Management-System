<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseItem extends Model
{
    use HasFactory;
    protected $table = 'purchase_item';
    protected $fillable = ['purchase_id', 'item_id', 'quantity', 'unit_price'];
    public $timestamps = false;
}
