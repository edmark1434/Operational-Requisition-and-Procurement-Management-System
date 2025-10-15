<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class notification extends Model
{
    protected $table = 'notification';
    protected $fillable = ['user_id','message','is_read','created_at','user_id'];
    public $timestamps = false;
}
