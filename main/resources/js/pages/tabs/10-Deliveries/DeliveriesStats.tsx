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
    const pendingDeliveries = deliveries.filter(d => d.STATUS === 'pending').length;
    const deliveredDeliveries = deliveries.filter(d => d.STATUS === 'delivered').length;
    const inTransitDeliveries = deliveries.filter(d => d.STATUS === 'in-transit').length;
    const totalValue = deliveries.reduce((sum, delivery) => sum + delivery.TOTAL_VALUE, 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Combined first two columns */}
            <div className="md:col-span-2 bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalDeliveries}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Deliveries</div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                            {formatCurrency(totalValue)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Total Value</div>
                    </div>
                </div>
            </div>

            {/* Remaining 3 columns divided equally */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {pendingDeliveries}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </div>

            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {inTransitDeliveries}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">In Transit</div>
            </div>

            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {deliveredDeliveries}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Delivered</div>
            </div>
        </div>
    );
}
