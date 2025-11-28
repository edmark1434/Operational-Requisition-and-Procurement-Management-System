interface DeliveryItem {
    ID: number;
    ITEM_ID: number;
    ITEM_NAME: string;
    QUANTITY: number;
    UNIT_PRICE: number;
    BARCODE?: string;
    CATEGORY?: string;
}

interface Delivery {
    ID: number;
    RECEIPT_NO: string;
    DELIVERY_DATE: string;
    TOTAL_COST: number;
    STATUS: string;
    REMARKS: string;
    RECEIPT_PHOTO: string;
    PO_ID: number;
    PO_REFERENCE: string;
    SUPPLIER_ID?: number;
    SUPPLIER_NAME: string;
    TOTAL_ITEMS: number;
    TOTAL_VALUE: number;
    ITEMS: DeliveryItem[];
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
    const totalValue = deliveries.reduce((sum, delivery) => sum + delivery.TOTAL_VALUE, 0);
    const serviceDeliveries = deliveries.filter(d => d.STATUS === 'service' || d.STATUS === 'serviced').length;
    const returnsDeliveries = deliveries.filter(d => d.STATUS === 'returned' || d.STATUS === 'returns').length;
    const reworksDeliveries = deliveries.filter(d => d.STATUS === 'rework' || d.STATUS === 'reworks').length;

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

            {/* Service Deliveries */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {serviceDeliveries}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Service Deliveries</div>
            </div>

            {/* Returns */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {returnsDeliveries}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Returns</div>
            </div>

            {/* Reworks */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {reworksDeliveries}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Reworks</div>
            </div>
        </div>
    );
}
