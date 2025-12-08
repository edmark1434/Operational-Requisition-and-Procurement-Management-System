<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Returns extends Model
{
    use HasFactory;

    protected $table = 'returns';
    public $timestamps = false;
    protected $guarded = [];

    /**
     * 1. Items Relationship
     */
    public function items()
    {
        return $this->hasMany(ReturnItem::class, 'return_id');
    }

    /**
     * 2. Deliveries (Direct Relation for EDIT Page)
     * Used by ReturnsController::edit
     */
    public function deliveries()
    {
        return $this->belongsToMany(
            Delivery::class,
            'return_delivery', // Pivot table
            'return_id',       // Local key
            'old_delivery_id'  // Foreign key
        );
    }

    /**
     * 3. Original Delivery (Pivot Relation for INDEX Page)
     * Used by WebPages\Returns::index
     * RESTORED THIS TO FIX YOUR 500 ERROR
     */
    public function originalDelivery()
    {
        return $this->hasOne(ReturnDelivery::class, 'return_id');
    }

    /**
     * Helper Accessor: Get the Delivery Object directly
     * Usage: $return->delivery
     */
    public function getDeliveryAttribute()
    {
        return $this->deliveries->first();
    }

    /**
     * Helper Accessor: Get Delivery ID safely
     * Usage: $return->delivery_id
     */
    public function getDeliveryIdAttribute()
    {
        return $this->deliveries->first()?->id;
    }
}
