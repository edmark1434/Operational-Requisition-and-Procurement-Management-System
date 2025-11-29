<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Item;
class Make extends Model
{
    use HasFactory;
    protected $table = 'make';
    protected $fillable = ['name','is_active'];
    public $timestamps = false;
    public function items()
    {
        return $this->hasMany(Item::class, 'make_id');
    }
}
