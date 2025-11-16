<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Returns extends Model
{
    use HasFactory;

    protected $table = 'returns';
    protected $primaryKey = 'id';
    public $timestamps = false; // you only have created_at

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
    public function delivery()
    {
        return $this->belongsTo(\App\Models\Delivery::class, 'delivery_id');
    }
    public function return_item()
    {
        return $this->belongsTo(\App\Models\ReturnItem::class, 'return_id');
    }
}
