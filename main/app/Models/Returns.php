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
        'ref_no',
        'return_date',
        'remarks',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
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
