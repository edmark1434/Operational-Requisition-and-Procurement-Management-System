<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\ReturnDelivery;
use App\Models\ReturnItem;
use App\Models\Delivery; // Import this

class Returns extends Model
{
    use HasFactory;

    protected $table = 'returns';
    protected $primaryKey = 'id';
    public $timestamps = false;
    public const STATUS = ['Pending','Issued','Rejected','Delivered'];

    protected $fillable = [
        'ref_no',
        'return_date',
        'remarks',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * ✅ FIX 1: Rename 'return_item' to 'items'
     * This matches Returns::with('items') in your controller
     */
    public function items()
    {
        return $this->hasMany(ReturnItem::class, 'return_id');
    }

    /**
     * ✅ FIX 2: Add 'delivery' relationship
     * This allows Returns::with('delivery.purchaseOrder') to work.
     * It skips over the 'return_delivery' table to get the actual Delivery.
     */
    public function delivery()
    {
        return $this->hasOneThrough(
            Delivery::class,       // The final model we want
            ReturnDelivery::class, // The intermediate model
            'return_id',           // Foreign key on return_delivery table
            'id',                  // Foreign key on delivery table
            'id',                  // Local key on returns table
            'old_delivery_id'      // Local key on return_delivery table
        );
    }

    // You can keep this if you need direct access to the pivot table
    public function originalDelivery()
    {
        return $this->hasOne(ReturnDelivery::class, 'return_id');
    }

    // Helper to make $return->delivery_id work in your controller
    // since the 'returns' table doesn't actually have that column
    public function getDeliveryIdAttribute()
    {
        return $this->originalDelivery->old_delivery_id ?? null;
    }
}
