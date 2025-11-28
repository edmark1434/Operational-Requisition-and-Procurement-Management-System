<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\UserPermission;
use App\Models\RolePermission;

class Permission extends Model
{
    use HasFactory;
    protected $table = 'permission';
    protected $fillable = ['name','category'];
    public $timestamps = false;
    public function user_permission(){
        return $this->hasMany(UserPermission::class,'perm_id');
    }
    public function role_permission(){
        return $this->hasMany(RolePermission::class,'perm_id');
    }
}
