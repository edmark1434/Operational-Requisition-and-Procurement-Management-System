// Service Status Colors
export const getServiceStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'active':
            return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border border-green-200 dark:border-green-800';
        case 'inactive':
            return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800';
        case 'pending':
            return 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 border border-orange-200 dark:border-orange-800';
        default:
            return 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
    }
};

// Service Category Colors
export const getServiceCategoryColor = (category: string) => {
    return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
};

// Price Range Colors
export const getPriceLevelColor = (rate: number) => {
    if (rate < 50) {
        return 'text-green-600 dark:text-green-400';
    } else if (rate < 80) {
        return 'text-orange-600 dark:text-green-300';
    } else {
        return 'text-red-600 dark:text-green-200';
    }
};
