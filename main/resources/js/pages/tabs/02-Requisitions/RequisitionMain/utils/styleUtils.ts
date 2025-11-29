export const getStatusColor = (status: string | undefined | null) => {
    // 1. Safety Check: If status is missing, return a default gray color
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';

    // 2. Now it is safe to use toLowerCase()
    switch (status.toLowerCase()) {
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'approved':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'rejected':
            return 'bg-red-100 text-red-800 border-red-200';
        // ... add your other cases here ...
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

export const getPriorityColor = (priority: string | undefined | null) => {
    // 1. Safety Check: If priority is missing, return default gray
    if (!priority) return 'bg-gray-100 text-gray-800 border-gray-200';

    // 2. Now safe to lowercase
    switch (priority.toLowerCase()) {
        case 'high':
            return 'bg-red-100 text-red-800 border-red-200'; // or your preferred colors
        case 'normal':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'low':
            return 'bg-gray-100 text-gray-800 border-gray-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};
