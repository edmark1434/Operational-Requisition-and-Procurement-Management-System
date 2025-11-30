interface Delivery {
    id: number;
    type: string;
    delivery_date: string;
    total_cost: number;
    receipt_no: string;
    receipt_photo: string | null;
    status: string;
    remarks: string | null;
    po_id: number | null;
}

export interface DeliveryItem {
    id: number;
    delivery_id: number | null;
    item_id: number | null;
    quantity: number;
    unit_price: number;
}

export interface DeliveryService {
    id: number;
    delivery_id: number;
    service_id: number;
    item_id: number | null;
}

interface DeliveriesStatsProps {
    deliveries: Delivery[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    }).format(amount);
};

export default function DeliveriesStats({ deliveries }: DeliveriesStatsProps) {
    // Calculate all statistics
    const totalDeliveries = deliveries.length;
    const itemDeliveries = deliveries.filter(d => d.type === 'Item Purchase').length;
    const serviceDeliveries = deliveries.filter(d => d.type === 'Service Delivery').length;
    const returnsReworksDeliveries = deliveries.filter(d => d.type === 'Item Return' || d.type === 'Service Rework').length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/*/!* Total Value *!/*/}
            {/*<div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">*/}
            {/*    <div className="text-2xl font-bold text-blue-600 dark:text-green-400 whitespace-nowrap">*/}
            {/*        {formatCurrency(totalValue)}*/}
            {/*    </div>*/}
            {/*    <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Estimated Total Value</div>*/}
            {/*</div>*/}

            {/* Total Deliveries */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {totalDeliveries}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Deliveries</div>
            </div>

            {/* Item Deliveries */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {itemDeliveries}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Item Deliveries</div>
            </div>

            {/* Service Deliveries */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {serviceDeliveries}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Service Deliveries</div>
            </div>

            {/* Returns and Reworks */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {returnsReworksDeliveries}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Returns and Reworks</div>
            </div>
        </div>
    );
}
