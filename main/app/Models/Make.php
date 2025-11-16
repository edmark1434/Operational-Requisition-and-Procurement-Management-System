<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Make extends Model
{
    use HasFactory;
    protected $table = 'make';
    protected $fillable = ['name'];
    public $timestamps = false;
    public function item()
    {
        return $this->hasMany(\App\Models\Item::class, 'make_id');
    }
}
