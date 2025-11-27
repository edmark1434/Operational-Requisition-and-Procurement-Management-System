// You can use the same formatters from requisitions, or add rework-specific ones
export { formatDate, formatTime, formatCurrency } from '../../02-Requisitions/RequisitionMain/utils/formatters';

// Rework-specific formatters
export const formatReworkStatus = (status: string) => {
    return status.split('_').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
};
