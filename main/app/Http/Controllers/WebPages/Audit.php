<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\AuditLogType;
use Inertia\Inertia;

use Illuminate\Http\Request;

class Audit extends Controller
{
    protected $base_path = "tabs/07-AuditLogs";
    public function index()
    {
        $audits = AuditLog::with(['type','user'])->orderBy('created_at','desc')->get()->map(function ($aud) {
            return [
                'id' => $aud->id,
                'type' => $aud->type->name,
                'description' => $aud->description,
                'created_at' => $aud->created_at,
                'user_id' => $aud->user_id,
                'user_name' => $aud->user->fullname

            ];
        });
        $types = AuditLogType::pluck('name');
        return Inertia::render($this->base_path .'/Main',[
            'audit_log' => $audits,
            'audit_log_type' => $types
        ]);
    }
}
