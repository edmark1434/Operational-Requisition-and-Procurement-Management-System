<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    use HasFactory;
    protected $table = 'purchase';
    protected $fillable = ['purchase_date', 'total_cost', 'receipt_no', 'receipt_photo', 'payment_type', 'req_id', 'supplier_id'];
    public $timestamps = false;
    public const PAYMENT_TYPE = ['CASH', 'STORE_CREDIT', 'DISBURSEMENT'];
}
