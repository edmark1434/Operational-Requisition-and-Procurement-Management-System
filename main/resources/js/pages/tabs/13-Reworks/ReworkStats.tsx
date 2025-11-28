interface ReworkStatsProps {
    reworks: any[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    }).format(amount);
};

export default function ReworkStats({ reworks }: ReworkStatsProps) {
    const totalReworks = reworks.length;
    const pendingReworks = reworks.filter(rework => rework.STATUS === 'pending').length;
    const issuedReworks = reworks.filter(rework => rework.STATUS === 'issued').length;
    const deliveredReworks = reworks.filter(rework => rework.STATUS === 'delivered').length;
    const rejectedReworks = reworks.filter(rework => rework.STATUS === 'rejected').length;
    const totalCost = reworks.reduce((sum, rework) => sum + rework.TOTAL_COST, 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Total Reworks */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {totalReworks}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Reworks</div>
            </div>

            {/* Pending Reworks */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {pendingReworks}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </div>

            {/* Issued Reworks */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {issuedReworks}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Issued</div>
            </div>

            {/* Delivered Reworks */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {deliveredReworks}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Delivered</div>
            </div>

            {/* Rejected Reworks */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {rejectedReworks}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
            </div>

            {/*/!* Total Cost - Full width on mobile, spans 2 columns on desktop *!/*/}
            {/*<div className="md:col-span-2 bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">*/}
            {/*    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 whitespace-nowrap">*/}
            {/*        {formatCurrency(totalCost)}*/}
            {/*    </div>*/}
            {/*    <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Total Cost</div>*/}
            {/*</div>*/}
        </div>
    );
}
