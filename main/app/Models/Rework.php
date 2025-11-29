<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Delivery;
use App\Models\ReworkService;
class Rework extends Model
{
    use HasFactory;
    protected $table = 'reworks';
    protected $fillable = ['created_at', 'status', 'remarks', 'delivery_id'];
    public const STATUS = ['Pending','Issued','Rejected','Delivered'];

    public function originalDelivery()
    {
        return $this->belongsToMany(Delivery::class, 'rework_delivery', 'rework_id', 'old_delivery_id');
    }

    public function newDelivery()
    {
        return $this->belongsToMany(Delivery::class, 'rework_delivery', 'rework_id', 'new_delivery_id');
    }

    public function rework_service(){
        $this->hasMany(ReworkService::class, 'rework_id');
    }
    public $timestamps = false;
}
