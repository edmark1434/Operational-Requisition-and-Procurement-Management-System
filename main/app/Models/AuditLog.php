<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
    public const TYPES = ['REQUISITION_APPROVAL',
                'REQUISITION_REJECTION',
                'REQUISITION_CHANGE',
                'SETTING_CHANGE',
                'SUPPLIER_UPDATE',
                'PERMISSION_UPDATE'];
}
