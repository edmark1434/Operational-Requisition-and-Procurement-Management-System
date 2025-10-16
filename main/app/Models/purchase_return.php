<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class returns extends Model
{
    protected $table = 'purchase_return';
    protected $fillable = ['return_date','status', 'remarks', 'purchase_id'];
    public $timestamps = false;
}
