<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequisitionItem extends Model
{
    use HasFactory;
    protected $table = 'requisition_item';
    protected $fillable = ['req_id', 'item_id', 'quantity'];
    public $timestamps = false;
}
