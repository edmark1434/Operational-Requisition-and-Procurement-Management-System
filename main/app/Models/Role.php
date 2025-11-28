<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\RolePermission;

class Role extends Model
{
    use HasFactory;
    protected $table = 'role';
    protected $fillable = ['name', 'description','is_active'];
    public $timestamps = false;

    public function role_permission(){
        return $this->hasMany(RolePermission::class,'role_id');
    }
    
}
