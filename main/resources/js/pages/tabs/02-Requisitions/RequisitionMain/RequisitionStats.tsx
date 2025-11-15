interface RequisitionStatsProps {
    requisitions: any[];
}

export default function RequisitionStats({ requisitions }: RequisitionStatsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {requisitions.filter(req => req.STATUS === 'Pending').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </div>
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {requisitions.filter(req => req.STATUS === 'Approved').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
            </div>
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {requisitions.filter(req => req.STATUS === 'Declined').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Declined</div>
            </div>
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {requisitions.filter(req => req.STATUS === 'Received').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Received</div>
            </div>
        </div>
    );
}
