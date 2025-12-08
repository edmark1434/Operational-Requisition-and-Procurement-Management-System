<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Delivery;
use App\Models\Service;
use App\Models\Item;

class DeliveryService extends Model
{
    use HasFactory;
    protected $table = 'delivery_services'; // Ensure table name is correct in DB
    protected $fillable = ['delivery_id', 'service_id', 'item_id', 'hourly_rate', 'hours'];
    public $timestamps = false;

    public function delivery() {
        return $this->belongsTo(Delivery::class, 'delivery_id'); // Added 'return'
    }

    public function service() {
        // This connects to the master Service list to get the Name
        return $this->belongsTo(Service::class, 'service_id'); // Added 'return'
    }

    public function item() {
        return $this->belongsTo(Item::class, 'item_id'); // Added 'return'
    }
}
