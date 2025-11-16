<?php

namespace Database\Factories;

use App\Models\OrderLink;
use App\Models\PurchaseOrder;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderLinkFactory extends Factory
{
    protected $model = OrderLink::class;

    public function definition(): array
    {
        return [
            'po_from_id' => PurchaseOrder::factory(),
            'po_to_id' => PurchaseOrder::factory(),
        ];
    }
}
