// You can use the same formatters from requisitions, or add service-specific ones
export { formatDate, formatTime, formatCurrency } from '../../02-Requisitions/RequisitionMain/utils/formatters';

// Service-specific formatters
export const formatHourlyRate = (rate: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    }).format(rate) + '/hr';
};

export const formatServiceStatus = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive';
};
