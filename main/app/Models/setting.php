<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class setting extends Model
{
    protected $table = 'setting';
    protected $fillable = ['category','key', 'value','description'];
    public $timestamps = false;
}
