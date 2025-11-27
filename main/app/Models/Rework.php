<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\PurchaseOrder;
use App\Models\ReworkService;
class Rework extends Model
{
    /** @use HasFactory<\Database\Factories\ReworkFactory> */
    use HasFactory;
    protected $table = 'reworks';
    protected $fillable = ['created_at', 'status', 'remarks', 'po_id'];
    public const STATUS = ['Pending','Issued','Rejected','Delivered'];

    public function purchase_order(){
        $this->belongsTo(PurchaseOrder::class, 'po_id');
    }
    public function rework_service(){
        $this->hasMany(ReworkService::class, 'rework_id');
    }
    public $timestamps = false;
}
