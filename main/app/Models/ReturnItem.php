<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReturnItem extends Model
{
    use HasFactory;
    protected $table = 'return_item';
    protected $fillable = ['req_id', 'item_id', 'quantity'];
    public $timestamps = false;
}
