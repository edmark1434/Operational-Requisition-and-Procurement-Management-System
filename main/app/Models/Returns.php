<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Delivery;
use App\Models\ReturnItem;

class Returns extends Model
{
    use HasFactory;

    protected $table = 'returns';
    protected $primaryKey = 'id';
    public $timestamps = false; // you only have created_at
    public const STATUS = ['Pending','Issued','Rejected','Delivered'];
    protected $fillable = [
        'created_at',
        'return_date',
        'status',
        'remarks',
        'delivery_id'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'return_date' => 'date',
    ];

    /**
     * Each return belongs to one delivery
     */
    public function originalDelivery()
    {
        return $this->belongsToMany(Delivery::class, 'return_delivery', 'return_id', 'old_delivery_id');
    }

    public function newDelivery()
    {
        return $this->belongsToMany(Delivery::class, 'return_delivery', 'return_id', 'new_delivery_id');
    }

    public function return_item()
    {
        return $this->belongsTo(ReturnItem::class, 'return_id');
    }
}
