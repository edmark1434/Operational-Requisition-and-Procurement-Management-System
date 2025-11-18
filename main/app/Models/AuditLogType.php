<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLogType extends Model
{
    protected $table = 'audit_log_type';
    protected $fillable = ['name'];
    public $timestamps = false;
    public function auditLogs(){
        return $this->hasMany(AuditLog::class,'type_id');
    }
}
