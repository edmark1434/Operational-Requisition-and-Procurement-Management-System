<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class permission extends Model
{
    protected $table = 'permission';
    protected $fillable = ['name'];
    public $timestamps = false;
}
