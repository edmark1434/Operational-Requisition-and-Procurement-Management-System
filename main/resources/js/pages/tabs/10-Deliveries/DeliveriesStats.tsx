interface DeliveriesStatsProps {
    deliveries: any[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    }).format(amount);
};

export default function DeliveriesStats({ deliveries }: DeliveriesStatsProps) {
    const totalDeliveries = deliveries.length;
    const receivedDeliveries = deliveries.filter(d => d.STATUS === 'received').length;
    const withReturnsDeliveries = deliveries.filter(d => d.STATUS === 'with returns').length;
    const totalValue = deliveries.reduce((sum, delivery) => sum + delivery.TOTAL_VALUE, 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Combined first column */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {totalDeliveries}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Deliveries</div>
            </div>

            {/* Total Value */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                    {formatCurrency(totalValue)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Total Value</div>
            </div>

            {/* Received */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {receivedDeliveries}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Received</div>
            </div>

            {/* With Returns */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {withReturnsDeliveries}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">With Returns</div>
            </div>
        </div>
    );
}
