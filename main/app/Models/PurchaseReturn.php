<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseReturn extends Model
{
    use HasFactory;
    protected $table = 'purchase_return';
    protected $fillable = ['return_date','status', 'remarks', 'purchase_id'];
    public $timestamps = false;
    public const STATUS = ['PENDING', 'REJECTED', 'DELIVERED', 'RECEIVED'];
}
