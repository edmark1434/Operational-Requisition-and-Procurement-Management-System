interface InventoryStatsProps {
    inventory: any[];
}

// Local formatter function
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    }).format(amount);
};

export default function InventoryStats({ inventory }: InventoryStatsProps) {
    const totalItems = inventory.length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.CURRENT_STOCK * item.UNIT_PRICE), 0);
    const lowStockItems = inventory.filter(item => item.CURRENT_STOCK > 0 && item.CURRENT_STOCK < 10).length;
    const outOfStockItems = inventory.filter(item => item.CURRENT_STOCK === 0).length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Combined first two columns */}
            <div className="md:col-span-2 bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalItems}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Items</div>
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
                    {lowStockItems}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Low Stock</div>
            </div>

            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {outOfStockItems}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Out of Stock</div>
            </div>
        </div>
    );
}
