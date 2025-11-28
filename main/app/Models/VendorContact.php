<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Vendor;
class VendorContact extends Model
{
    /** @use HasFactory<\Database\Factories\VendorContactFactory> */
    use HasFactory;

    protected $fillable = ['name', 'position', 'email', 'contact_number', 'vendor_id', 'is_active'];

    public function vendor(){
        $this->belongsTo(Vendor::class, 'vendor_id');
    }
    public $timestamps = false;
}
