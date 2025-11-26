import { useMemo } from 'react';

export const usePurchaseFilters = (
    purchases: any[],
    searchTerm: string,
    statusFilter: string,
    supplierFilter: string,
    orderTypeFilter: string = 'All'
) => {
    const filteredPurchases = useMemo(() => {
        return purchases.filter(purchase => {
            const matchesSearch = searchTerm === '' ||
                purchase.REFERENCE_NO.toLowerCase().includes(searchTerm.toLowerCase()) ||
                purchase.SUPPLIER_NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
                purchase.ITEMS?.some((item: any) =>
                    item.NAME.toLowerCase().includes(searchTerm.toLowerCase())
                ) ||
                purchase.SERVICES?.some((service: any) =>
                    service.NAME.toLowerCase().includes(searchTerm.toLowerCase())
                );

            const matchesStatus = statusFilter === 'All' || purchase.STATUS === statusFilter.toLowerCase();
            const matchesSupplier = supplierFilter === 'All' || purchase.SUPPLIER_NAME === supplierFilter;
            const matchesOrderType = orderTypeFilter === 'All' || purchase.ORDER_TYPE === orderTypeFilter.toLowerCase();

            return matchesSearch && matchesStatus && matchesSupplier && matchesOrderType;
        });
    }, [purchases, searchTerm, statusFilter, supplierFilter, orderTypeFilter]);

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

    const orderTypes = useMemo(() => {
        const uniqueOrderTypes = [...new Set(purchases.map(purchase => purchase.ORDER_TYPE))];
        return ['All', ...uniqueOrderTypes.map(type =>
            type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Items'
        )];
    }, [purchases]);

    return {
        filteredPurchases,
        statuses,
        suppliers,
        orderTypes
    };
};
