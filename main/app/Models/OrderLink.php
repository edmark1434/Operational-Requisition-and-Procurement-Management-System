<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\PurchaseOrder;
class OrderLink extends Model
{
    /** @use HasFactory<\Database\Factories\OrderLinkFactory> */
    use HasFactory;
    protected $table = 'order_link';

    protected $fillable = [
        'po_from_id', 'po_to_id'
    ];

    public function linksFrom()
    {
        return $this->belongsTo(PurchaseOrder::class,'po_from_id');
    }

    public function linksTo()
    {
        return $this->belongsTo(PurchaseOrder::class,'po_to_id');
    }


    public $timestamps = false;
}
