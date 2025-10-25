// Requisition Status Colors
export const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'approved':
            return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border border-green-200 dark:border-green-800';
        case 'pending':
            return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
        case 'draft':
            return 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
        case 'declined':
        case 'rejected':
            return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800';
        default:
            return 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
    }
};

// Requisition Priority Colors
export const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
        case 'urgent':
            return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800';
        case 'high':
            return 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 border border-orange-200 dark:border-orange-800';
        case 'normal':
            return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
        case 'low':
            return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border border-green-200 dark:border-green-800';
        default:
            return 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
    }
};

// Inventory Stock Status Colors
export const getStockStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'in-stock':
            return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border border-green-200 dark:border-green-800';
        case 'low-stock':
            return 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 border border-orange-200 dark:border-orange-800';
        case 'out-of-stock':
            return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800';
        default:
            return 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
    }
};

// Inventory Category Colors (optional - for category badges)
export const getCategoryColor = (category: string) => {
    return 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
};

// Value Range Colors (for stats or value-based indicators)
export const getValueColor = (value: number, thresholds = { low: 50, medium: 200 }) => {
    if (value < thresholds.low) {
        return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border border-green-200 dark:border-green-800';
    } else if (value < thresholds.medium) {
        return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800';
    } else {
        return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800';
    }
};

// Stock Level Colors (for visual indicators)
export const getStockLevelColor = (current: number, min: number = 10, max: number = 100) => {
    const percentage = (current / max) * 100;

    if (current === 0) {
        return 'bg-red-500';
    } else if (percentage < 20) {
        return 'bg-orange-500';
    } else if (percentage < 50) {
        return 'bg-yellow-500';
    } else {
        return 'bg-green-500';
    }
};
