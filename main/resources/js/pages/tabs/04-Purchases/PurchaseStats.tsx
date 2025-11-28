interface PurchaseStatsProps {
    purchases: any[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    }).format(amount);
};

export default function PurchaseStats({ purchases }: PurchaseStatsProps) {
    const totalOrders = purchases.length;
    const totalValue = purchases.reduce((sum, purchase) => sum + purchase.TOTAL_COST, 0);

    // Separate counts for each status
    const pendingOrders = purchases.filter(p => p.STATUS === 'pending').length;
    const issuedOrders = purchases.filter(p => p.STATUS === 'issued').length;
    const deliveredOrders = purchases.filter(p => p.STATUS === 'delivered').length;
    const receivedOrders = purchases.filter(p => p.STATUS === 'received').length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Total Orders & Total Value */}
            <div className="md:col-span-2 bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalOrders}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Orders</div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                            {formatCurrency(totalValue)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Total Value</div>
                    </div>
                </div>
            </div>

            {/* Pending Orders */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {pendingOrders}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </div>

            {/* Issued Orders */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {issuedOrders}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Issued</div>
            </div>

            {/* Delivered Orders */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {deliveredOrders}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Delivered</div>
            </div>

            {/* Received Orders */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {receivedOrders}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Received</div>
            </div>
        </div>
    );
}
