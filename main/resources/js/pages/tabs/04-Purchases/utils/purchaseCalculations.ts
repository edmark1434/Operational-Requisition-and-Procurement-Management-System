// In your purchaseCalculations.ts or styleUtils.ts
export const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'pending_approval':
            return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
        case 'approved':
            return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border border-green-200 dark:border-green-800';
        case 'completed':
            return 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300 border border-teal-200 dark:border-teal-800';
        case 'pending':
            return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
        case 'merged':
            return 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border border-purple-200 dark:border-purple-800';
        case 'issued':
            return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border border-green-200 dark:border-green-800';
        case 'rejected':
            return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800';
        case 'delivered':
            return 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300 border border-teal-200 dark:border-teal-800';
        case 'partially_delivered':
            return 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 border border-orange-200 dark:border-orange-800';
        case 'received':
            return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
        default:
            return 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
    }
};

// In your purchaseCalculations.ts
export const getStatusDisplayName = (status: string): string => {
    const statusMap: { [key: string]: string } = {
        'pending_approval': 'Pending Approval',
        'approved': 'Approved',
        'completed': 'Completed',
        'pending': 'Pending',
        'merged': 'Merged',
        'issued': 'Issued',
        'rejected': 'Rejected',
        'delivered': 'Delivered',
        'partially_delivered': 'Partially Delivered',
        'received': 'Received'
    };
    return statusMap[status?.toLowerCase()] || status;
};
