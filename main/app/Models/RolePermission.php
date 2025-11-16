<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Role;
use App\Models\Permission;
class RolePermission extends Model
{
    use HasFactory;
    protected $table = 'role_permission';
    protected $fillable = ['role_id', 'perm_id'];
    public $timestamps = false;

    public function role(){
        return $this->belongsTo(Role::class,'role_id');
    }
    public function permission(){
        return $this->belongsTo(Permission::class,'perm_id');
    }
}
