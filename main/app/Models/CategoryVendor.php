<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Vendor;
use App\Models\Category;
class CategoryVendor extends Model
{
    use HasFactory;
    protected $table = 'category_vendor';
    protected $fillable = [
        'category_id',
        'vendor_id',
    ];
    public function category()
    {
        return $this->belongsTo(Category::class,'category_id');
    }
    public function vendor()
    {
        return $this->belongsTo(Vendor::class,'vendor_id');
    }
    public $timestamps = false;
}
