<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// Imported related models
use App\Models\CategoryVendor;
use App\Models\Item;
use App\Models\Service; // Added this import

class Category extends Model
{
    use HasFactory;

    // Explicit table name since it is singular 'category' in DB, not 'categories'
    protected $table = 'category';

    // Disabling timestamps as requested
    public $timestamps = false;

    protected $fillable = [
        'name',
        'description',
        'type',
        'is_active'
    ];

    /**
     * Relationship: A Category has many Items
     */
    public function items()
    {
        return $this->hasMany(Item::class, 'category_id');
    }

    /**
     * Relationship: A Category has many Services
     */
    public function service()
    {
        // Note: The second argument is the Foreign Key on the 'services' table.
        // It is usually 'category_id', linking back to this model.
        return $this->hasMany(Service::class, 'category_id');
    }

    /**
     * Relationship: A Category has many CategoryVendors
     */
    public function categoryVendor()
    {
        return $this->hasMany(CategoryVendor::class, 'category_id');
    }
}
