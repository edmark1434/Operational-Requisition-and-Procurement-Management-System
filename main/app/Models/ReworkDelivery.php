<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ReworkDelivery extends Model
{
    use HasFactory;

    protected $table = 'rework_delivery';

    public $timestamps = false;

    protected $fillable = [
        'rework_id',
        'old_delivery_id',
        'new_delivery_id',
    ];

    /**
     * Relationships
     */

    public function rework()
    {
        return $this->belongsTo(Rework::class, 'rework_id');
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
