<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Permission;
class UserPermission extends Model
{
    use HasFactory;
    protected $table = 'user_permission';
    protected $fillable = ['user_id', 'perm_id'];
    public $timestamps = false;

    public function user(){
        return $this->belongsTo(User::class,'user_id');
    }
    public function permission(){
        return $this->belongsTo(Permission::class,'perm_id');
    }
}
