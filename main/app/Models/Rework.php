<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\ReworkDelivery;
use App\Models\ReworkService;
class Rework extends Model
{
    use HasFactory;
    protected $table = 'reworks';
    protected $fillable = ['ref_no', 'created_at', 'status', 'remarks'];
    public const STATUS = ['Pending','Issued','Rejected','Delivered'];

    public function reworkDeliveries()
    {
        return $this->hasMany(ReworkDelivery::class, 'rework_id');
    }

    public function originalDelivery()
    {
        return $this->hasOne(ReworkDelivery::class, 'rework_id');
    }

    public function newDelivery()
    {
        return $this->hasOne(ReworkDelivery::class, 'rework_id');
    }
    public function rework_service()
    {
        return $this->hasOne(ReworkService::class, 'rework_id');
    }
    public $timestamps = false;
}
