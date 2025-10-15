<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class role_permission extends Model
{
    protected $table = 'role_permission';
    protected $fillable = ['role_id', 'perm_id'];
    public $timestamps = false;
}
