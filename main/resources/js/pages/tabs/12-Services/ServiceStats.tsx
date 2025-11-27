interface ServiceStatsProps {
    services: any[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    }).format(amount);
};

export default function ServiceStats({ services }: ServiceStatsProps) {
    const totalServices = services.length;
    const activeServices = services.filter(service => service.IS_ACTIVE).length;
    const inactiveServices = services.filter(service => !service.IS_ACTIVE).length;
    const averageRate = services.reduce((sum, service) => sum + service.HOURLY_RATE, 0) / totalServices;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Services */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {totalServices}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Services</div>
            </div>

            {/* Active Services */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {activeServices}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Services</div>
            </div>

            {/* Inactive Services */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {inactiveServices}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Inactive Services</div>
            </div>

            {/* Average Rate */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 whitespace-nowrap">
                    {formatCurrency(averageRate)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Avg. Hourly Rate</div>
            </div>
        </div>
    );
}
