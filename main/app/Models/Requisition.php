<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Requisition extends Model
{
    use HasFactory;

    protected $table = 'requisition';

    // REMOVED 'references_no' from fillable because it is auto-generated
    protected $fillable = [
        'status',
        'remarks',
        'user_id',
        'requestor',
        'notes',
        'priority',
        'type',
        'total_cost'
    ];

    public $timestamps = true;

    // Constants
    public const TYPES = ['Items','Services'];
    public const STATUS = ['Pending', 'Rejected', 'Approved', 'Partially Approved', 'Ordered','Delivered','Awaiting Pickup', 'Completed'];
    public const PRIORITY = ['Low', 'Normal', 'High'];

    /**
     * The "booted" method of the model.
     * This is where we handle the auto-generation logic.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            // 1. Get the latest record by ID
            $latest = self::latest('id')->first();

            if (! $latest) {
                // Table is empty
                $nextId = 1;
            } else {
                // 2. Strict Parsing: Remove everything except digits (0-9)
                // "REQ-000001" -> "000001" -> 1
                $stringNumber = preg_replace('/[^0-9]/', '', $latest->ref_no ?? '');

                // Fallback: If parsing failed (empty), use the ID
                $lastNumber = $stringNumber ? (int)$stringNumber : $latest->id;

                $nextId = $lastNumber + 1;
            }

            // 3. COLLISION PREVENTION LOOP (Crucial Fix)
            // If REQ-000001 exists, try REQ-000002, then REQ-000003, until free.
            $ref = '';
            do {
                $ref = 'REQ-' . str_pad($nextId, 6, '0', STR_PAD_LEFT);
                $exists = self::where('ref_no', $ref)->exists();
                if ($exists) {
                    $nextId++;
                }
            } while ($exists);

            // 4. Assign the final unique reference
            $model->ref_no = $ref;
        });
    }

    // Relationships

    public function user(){
        return $this->belongsTo(User::class,'user_id');
    }

    public function requisition_items(){
        return $this->hasMany(RequisitionItem::class,'req_id');
    }

    public function purchase_orders(){
        return $this->hasMany(PurchaseOrder::class,'req_id');
    }

    public function requisition_services(){
        return $this->hasMany(RequisitionService::class, 'req_id');
    }
}
