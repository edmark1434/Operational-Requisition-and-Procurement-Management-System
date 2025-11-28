<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Returns;
use App\Models\Item;
class ReturnItem extends Model
{
    use HasFactory;
    protected $table = 'return_item';
    protected $fillable = ['return_id', 'item_id', 'quantity'];
    public $timestamps = false;
    public function returns(){
        return $this->belongsTo(Returns::class,'return_id');
    }
    public function item(){
        return $this->belongsTo(Item::class,'item_id');
    }
}
