// You can use the same formatters from other modules, or add specific ones
export { formatDate, formatTime, formatCurrency } from '../../02-Requisitions/RequisitionMain/utils/formatters';

// Roles & Permissions specific formatters
export const formatStatus = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive';
};

export const formatPermissionCategory = (category: string) => {
    const categoryMap: { [key: string]: string } = {
        'user': 'User Permissions',
        'data': 'Data Permissions',
        'system': 'System Permissions'
    };
    return categoryMap[category] || category;
};

export const formatPermissionName = (name: string) => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const formatRoleDescription = (description: string) => {
    return description || 'No description provided';
};
