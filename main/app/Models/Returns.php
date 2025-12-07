<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\ReturnDelivery;
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
        return $this->hasOne(ReturnDelivery::class,  'return_id');
    }

    public function newDelivery()
    {
        return $this->hasOne(ReturnDelivery::class, 'return_id', 'new_delivery_id');
    }

    public function return_item()
    {
        return $this->hasOne(ReturnItem::class, 'return_id');
    }
}
