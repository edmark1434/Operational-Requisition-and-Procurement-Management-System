<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ReturnDelivery extends Model
{
    use HasFactory;

    protected $table = 'return_delivery';

    protected $fillable = [
        'return_id',
        'old_delivery_id',
        'new_delivery_id',
    ];

    /**
     * Relationships
     */

    public function return()
    {
        return $this->belongsTo(Returns::class, 'return_id');
    }

    public function oldDelivery()
    {
        return $this->belongsTo(Delivery::class, 'old_delivery_id');
    }

    public function newDelivery()
    {
        return $this->belongsTo(Delivery::class, 'new_delivery_id');
    }
}
