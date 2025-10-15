<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class purchase extends Model
{
    protected $table = 'purchase';
    protected $fillable = ['purchase_date', 'total_cost', 'receipt_no', 'receipt_photo', 'payment_type', 'req_id', 'supplier_id'];
    public $timestamps = false;
}
