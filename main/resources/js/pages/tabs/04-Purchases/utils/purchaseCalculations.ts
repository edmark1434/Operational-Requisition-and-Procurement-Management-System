export const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'pending_approval':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200';
        case 'approved':
            return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200';
        case 'rejected':
            return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200';
        case 'sent_dispatched':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
        case 'closed':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
};

export const getStatusDisplayName = (status: string) => {
    switch (status.toLowerCase()) {
        case 'pending_approval':
            return 'Pending Approval';
        case 'approved':
            return 'Approved';
        case 'rejected':
            return 'Rejected';
        case 'sent_dispatched':
            return 'Sent & Dispatched';
        case 'closed':
            return 'Closed';
        default:
            return status.charAt(0).toUpperCase() + status.slice(1);
    }
};
