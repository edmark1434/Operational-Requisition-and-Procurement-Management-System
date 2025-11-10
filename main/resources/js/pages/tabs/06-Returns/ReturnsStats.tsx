interface ReturnsStatsProps {
    returns: any[];
}

// Local formatter function
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    }).format(amount);
};

export default function ReturnsStats({ returns }: ReturnsStatsProps) {
    const totalReturns = returns.length;
    const pendingReturns = returns.filter(r => r.STATUS === 'pending').length;
    const completedReturns = returns.filter(r => r.STATUS === 'completed').length;
    const totalValue = returns.reduce((sum, returnItem) => sum + returnItem.TOTAL_VALUE, 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Combined first two columns */}
            <div className="md:col-span-2 bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalReturns}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Returns</div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                            {formatCurrency(totalValue)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Total Value</div>
                    </div>
                </div>
            </div>

            {/* Remaining 2 columns divided equally */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {pendingReturns}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pending Returns</div>
            </div>

            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {completedReturns}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
            </div>
        </div>
    );
}
