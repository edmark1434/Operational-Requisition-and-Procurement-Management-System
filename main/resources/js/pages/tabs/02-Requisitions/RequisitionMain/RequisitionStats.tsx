interface RequisitionStatsProps {
    requisitions: any[];
}

export default function RequisitionStats({ requisitions }: RequisitionStatsProps) {
    const getStatusDisplayName = (status: string): string => {
        const statusMap: { [key: string]: string } = {
            'pending': 'Pending',
            'approved': 'Approved',
            'rejected': 'Rejected',
            'partially_approved': 'Partially Approved',
            'ordered': 'Ordered',
            'delivered': 'Delivered',
            'awaiting_pickup': 'Awaiting Pickup',
            'received': 'Received'
        };
        return statusMap[status?.toLowerCase()] || status;
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {requisitions.filter(req => req.STATUS?.toLowerCase() === 'pending').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </div>
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {requisitions.filter(req => req.STATUS?.toLowerCase() === 'approved').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
            </div>
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {requisitions.filter(req => req.STATUS?.toLowerCase() === 'rejected').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
            </div>
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {requisitions.filter(req => req.STATUS?.toLowerCase() === 'received').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Received</div>
            </div>
        </div>
    );
}
