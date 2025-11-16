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
    public function category(){
        return $this->hasMany(CategorySupplier::class,'category_id');
    }
    public $timestamps = false;
    public function item()
    {
        return $this->hasMany(\App\Models\Item::class, 'category_id');
    }
    public function categorySupplier(){
        return $this->hasMany(\App\Models\CategorySupplier::class, 'category_id');
    }
}
