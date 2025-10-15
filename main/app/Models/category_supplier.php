<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class category_supplier extends Model
{
    protected $table = 'category_supplier';
    protected $fillable = [
        'category_id',
        'supplier_id',
    ];
    public $timestamps = false;
}
