<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    protected $table = 'permission';
    protected $fillable = ['name'];
    public $timestamps = false;
    public function user_permission(){
        return $this->hasMany(\App\Models\UserPermission::class,'perm_id');
    }
    public function role_permission(){
        return $this->hasMany(\App\Models\RolePermission::class,'perm_id');
    }
}
