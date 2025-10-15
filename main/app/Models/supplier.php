<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class supplier extends Model
{
    protected $table = 'supplier';
    protected $fillable = [
        'name',
        'contact_info',
        'allows_cash',
        'allows_disbursement',
        'allows_store_credit',
    ];
    public $timestamps = false;
}
