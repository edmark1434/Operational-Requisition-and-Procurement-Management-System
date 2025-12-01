import { useMemo } from 'react';

export const useSupplierFilters = (
    suppliers: any[],
    searchTerm: string,
    paymentFilter: string
) => {
    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(supplier => {
            const matchesSearch = searchTerm === '' ||
                supplier?.NAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supplier?.EMAIL?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supplier?.CONTACT_NUMBER?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supplier.CATEGORIES.some((category: string) =>
                    category.toLowerCase().includes(searchTerm.toLowerCase())
                );

            const matchesPayment = paymentFilter === 'All' ||
                (paymentFilter === 'Cash' && supplier.ALLOWS_CASH) ||
                (paymentFilter === 'Disbursement' && supplier.ALLOWS_DISBURSEMENT) ||
                (paymentFilter === 'Store Credit' && supplier.ALLOWS_STORE_CREDIT);

            return matchesSearch && matchesPayment;
        });
    }, [suppliers, searchTerm, paymentFilter]);

    const paymentOptions = useMemo(() => {
        return ['All', 'Cash', 'Disbursement', 'Store Credit'];
    }, []);

    return {
        filteredSuppliers,
        paymentOptions
    };
};
