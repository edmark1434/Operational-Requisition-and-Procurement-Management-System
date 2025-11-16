<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CategorySupplier extends Model
{
    use HasFactory;
    protected $table = 'category_supplier';
    protected $fillable = [
        'category_id',
        'supplier_id',
    ];
    public function category()
    {
        return $this->belongsTo(Category::class,'category_id');
    }
    public function supplier()
    {
        return $this->belongsTo(Supplier::class,'supplier_id');
    }
    public $timestamps = false;
}
