// You can use the same formatters from requisitions, or add contact-specific ones
export { formatDate, formatTime, formatCurrency } from '../../02-Requisitions/RequisitionMain/utils/formatters';

// Contact-specific formatters
export const formatPhoneNumber = (phone: string) => {
    if (!phone) return 'N/A';

    // Basic phone formatting - you can enhance this based on your needs
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    if (cleaned.length === 11 && cleaned[0] === '1') {
        return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }

    return phone; // Return original if format doesn't match
};

export const formatContactStatus = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive';
};

export const formatInitials = (name: string) => {
    if (!name) return '??';

    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();

    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

export const formatVendorName = (vendorName: string) => {
    if (!vendorName) return 'Unknown Vendor';

    // Remove common suffixes for cleaner display
    return vendorName
        .replace(/\b(Co\.?|Corp\.?|Corporation|Inc\.?|Limited|Ltd\.?|Company)\b/gi, '')
        .trim();
};
