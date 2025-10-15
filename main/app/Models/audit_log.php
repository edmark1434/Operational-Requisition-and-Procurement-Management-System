<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class audit_log extends Model
{
    protected $table = 'audit_log';
    protected $fillable = [
        'type',
        'decription',
        'created_at',
        'user_id',
    ];
    public $timestamps = false;
}
