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
    const issuedReturns = returns.filter(r => r.STATUS === 'issued').length;
    const deliveredReturns = returns.filter(r => r.STATUS === 'delivered').length;
    const rejectedReturns = returns.filter(r => r.STATUS === 'rejected').length;
    const totalValue = returns.reduce((sum, returnItem) => sum + returnItem.TOTAL_VALUE, 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Combined first two columns */}
            {/* Status columns */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-orange-600 dark:text-blue-500">
                    {totalReturns}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Returns</div>
            </div>

            {/* Status columns */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {pendingReturns}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </div>

            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {issuedReturns}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Issued</div>
            </div>

            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {deliveredReturns}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Delivered</div>
            </div>

            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {rejectedReturns}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
            </div>
        </div>
    );
}
