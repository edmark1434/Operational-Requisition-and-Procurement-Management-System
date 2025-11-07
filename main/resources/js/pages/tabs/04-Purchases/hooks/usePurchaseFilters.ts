import { useMemo } from 'react';

export const usePurchaseFilters = (
    purchases: any[],
    searchTerm: string,
    statusFilter: string,
    supplierFilter: string
) => {
    const filteredPurchases = useMemo(() => {
        return purchases.filter(purchase => {
            const matchesSearch = searchTerm === '' ||
                purchase.REFERENCE_NO.toLowerCase().includes(searchTerm.toLowerCase()) ||
                purchase.SUPPLIER_NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
                purchase.ITEMS.some((item: any) =>
                    item.NAME.toLowerCase().includes(searchTerm.toLowerCase())
                );

            const matchesStatus = statusFilter === 'All' || purchase.STATUS === statusFilter.toLowerCase();
            const matchesSupplier = supplierFilter === 'All' || purchase.SUPPLIER_NAME === supplierFilter;

            return matchesSearch && matchesStatus && matchesSupplier;
        });
    }, [purchases, searchTerm, statusFilter, supplierFilter]);

    const statuses = useMemo(() => {
        const uniqueStatuses = [...new Set(purchases.map(purchase => purchase.STATUS))];
        return ['All', ...uniqueStatuses.map(status =>
            status.charAt(0).toUpperCase() + status.slice(1)
        )];
    }, [purchases]);

    const suppliers = useMemo(() => {
        const uniqueSuppliers = [...new Set(purchases.map(purchase => purchase.SUPPLIER_NAME))];
        return ['All', ...uniqueSuppliers.sort()];
    }, [purchases]);

    return {
        filteredPurchases,
        statuses,
        suppliers
    };
};
