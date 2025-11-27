// You can use the same formatters from other modules, or add specific ones
export { formatDate, formatTime, formatCurrency } from '../../02-Requisitions/RequisitionMain/utils/formatters';

// Makes & Categories specific formatters
export const formatStatus = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive';
};

export const formatCategoryType = (type: string) => {
    return type === 'item' ? 'Item Category' : 'Service Category';
};

export const formatMakeName = (name: string) => {
    return name.trim();
};

export const formatCategoryDescription = (description: string) => {
    return description || 'No description provided';
};
