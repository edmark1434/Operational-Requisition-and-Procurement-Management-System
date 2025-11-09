// You can use the same formatters from requisitions, or add supplier-specific ones
export { formatDate, formatTime, formatCurrency } from '../../02-Requisitions/RequisitionMain/utils/formatters';

// Supplier-specific formatters
export const formatPhoneNumber = (phone: string) => {
    // Basic phone number formatting
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
};

export const formatPaymentMethods = (supplier: any) => {
    const methods = [];
    if (supplier.ALLOWS_CASH) methods.push('Cash');
    if (supplier.ALLOWS_DISBURSEMENT) methods.push('Disbursement');
    if (supplier.ALLOWS_STORE_CREDIT) methods.push('Store Credit');
    return methods.length > 0 ? methods.join(', ') : 'None';
};
