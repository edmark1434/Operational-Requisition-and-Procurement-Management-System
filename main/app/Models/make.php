<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class make extends Model
{
    protected $table = 'make';
    protected $fillable = ['name'];
    public $timestamps = false;
}
