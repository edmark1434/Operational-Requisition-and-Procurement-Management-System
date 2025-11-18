<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\CategorySupplier;
class Category extends Model
{
    use HasFactory;
    protected $table = 'category';
    protected $fillable = ['name', 'description'];
    public $timestamps = false;
    public function items()
    {
        return $this->hasMany(\App\Models\Item::class, 'category_id');
    }
    public function categorySuppliers(){
        return $this->hasMany(\App\Models\CategorySupplier::class, 'category_id');
    }
}
