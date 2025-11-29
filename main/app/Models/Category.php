<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\CategoryVendor;
use App\Models\Item;

class Category extends Model
{
    use HasFactory;
    protected $table = 'category';
    protected $fillable = ['name', 'description', 'type', 'is_active'];

    public function items()
    {
        return $this->hasMany(Item::class, 'category_id');
    }
    public function service()
    {
        return $this->hasMany(Service::class, 'service_id');
    }
    public function categoryVendor(){
        return $this->hasMany(CategoryVendor::class, 'category_id');
    }
    public $timestamps = false;
}
