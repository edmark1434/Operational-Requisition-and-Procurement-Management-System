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
        'type_id',
        'description',
        'user_id',
    ];
    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class,'user_id');
    }

    public function type()
    {
        return $this->belongsTo(AuditLogType::class,'type_id');
    }
}
