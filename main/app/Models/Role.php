<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $table = 'role';
    protected $fillable = ['name', 'description'];
    public $timestamps = false;

    public function role_permission(){
        return $this->hasMany(\App\Models\RolePermission::class,'role_id');
    }

}
