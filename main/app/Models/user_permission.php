<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class user_permission extends Model
{
    protected $table = 'user_permission';
    protected $fillable = ['user_id', 'perm_id'];
    public $timestamps = false;
}
