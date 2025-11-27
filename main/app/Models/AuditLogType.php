<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\AuditLog;
class AuditLogType extends Model
{
    /** @use HasFactory<\Database\Factories\AuditLogTypeFactory> */
    use HasFactory;
    protected $table = 'audit_log_types';
    protected $fillable = ['name'];

    public function audit_log(){
        $this->hasMany(AuditLog::class, 'type_id');
    }
    public $timestamps = false;
}
