<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Rework;
use App\Models\Service;
use App\Models\Item;
class ReworkService extends Model
{
    /** @use HasFactory<\Database\Factories\ReworkServiceFactory> */
    use HasFactory;

    protected $fillable = ['rework_id', 'service_id', 'item_id'];

    public function rework(){
        $this->belongsTo(Rework::class, 'rework_id');
    }
    public function service(){
        $this->belongsTo(Service::class, 'service_id');
    }
    public function item(){
        $this->belongsTo(Item::class, 'item_id');
    }
    public $timestamps = false;
}
