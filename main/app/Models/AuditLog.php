<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
class AuditLog extends Model
{
    use HasFactory;
    protected $table = 'audit_log';
    protected $fillable = [
        'type',
        'description',
        'user_id',
    ];
    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class,'user_id');
    }
   public const TYPES = ['REQUISITION APPROVAL',
               'REQUISITION REJECTION',
               'REQUISITION CHANGE',
               'SETTING CHANGE',
               'SUPPLIER UPDATE',
               'PERMISSION UPDATE',
               'REQUISITION DELIVERY',
               'RETURN REJECTION',
               'RETURN DELIVERY',
               'ITEM INFO CHANGE'
            ];
}
