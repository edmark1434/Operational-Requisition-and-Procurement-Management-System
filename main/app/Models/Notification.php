<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
class Notification extends Model
{
    use HasFactory;
    protected $table = 'notification';
    protected $fillable = ['user_id','message','is_read','created_at'];

    public function user(){
        return $this->belongsTo(User::class,'user_id');
    }

    public $timestamps = false;
}
