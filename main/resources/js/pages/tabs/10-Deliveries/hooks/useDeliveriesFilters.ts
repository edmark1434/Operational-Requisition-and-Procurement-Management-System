import { useMemo } from 'react';

interface Delivery {
    id: number;
    type: string;
    delivery_date: string;
    total_cost: number;
    receipt_no: string;
    receipt_photo: string | null;
    status: string;
    remarks: string | null;
    po_id: number | null;
    purchase_order: any;
    ref_no?: string;
    supplier_name?: string;
}

export const useDeliveriesFilters = (
    deliveries: Delivery[],
    searchTerm: string,
    statusFilter: string,
    dateFilter: string,
    typeFilter: string
) => {
    // Date ranges for filter dropdown
    const dateRanges = [
        'All',
        'Today',
        'Yesterday',
        'Last 7 Days',
        'Last 30 Days',
        'This Month',
        'Last Month',
        'This Year'
    ];

    const filteredDeliveries = useMemo(() => {
        console.log('Filtering deliveries...', {
            total: deliveries.length,
            searchTerm,
            statusFilter,
            typeFilter,
            dateFilter
        });

        return deliveries.filter(delivery => {
            // 1. Search filter
            if (searchTerm && searchTerm.trim() !== '') {
                const searchLower = searchTerm.toLowerCase().trim();
                const receiptMatch = delivery.receipt_no?.toLowerCase().includes(searchLower) || false;
                const refMatch = delivery.ref_no?.toLowerCase().includes(searchLower) || false;
                const supplierMatch = delivery.supplier_name?.toLowerCase().includes(searchLower) || 
                                     delivery.purchase_order?.vendor?.name?.toLowerCase().includes(searchLower) || false;
                
                if (!(receiptMatch || refMatch || supplierMatch)) {
                    return false;
                }
            }

            // 2. Status filter
            if (statusFilter !== 'All' && delivery.status !== statusFilter) {
                return false;
            }

            // 3. Type filter
            if (typeFilter !== 'All' && delivery.type !== typeFilter) {
                return false;
            }

            // 4. Date filter
            if (dateFilter !== 'All') {
                const deliveryDate = new Date(delivery.delivery_date);
                const now = new Date();
                
                // Normalize dates to start of day for comparison
                const normalizeDate = (date: Date) => {
                    const normalized = new Date(date);
                    normalized.setHours(0, 0, 0, 0);
                    return normalized;
                };

                const normalizedDeliveryDate = normalizeDate(deliveryDate);
                const today = normalizeDate(now);

                switch (dateFilter) {
                    case 'Today':
                        return normalizedDeliveryDate.getTime() === today.getTime();
                        
                    case 'Yesterday':
                        const yesterday = new Date(today);
                        yesterday.setDate(today.getDate() - 1);
                        return normalizedDeliveryDate.getTime() === yesterday.getTime();
                        
                    case 'Last 7 Days':
                        const sevenDaysAgo = new Date(today);
                        sevenDaysAgo.setDate(today.getDate() - 7);
                        return normalizedDeliveryDate >= sevenDaysAgo;
                        
                    case 'Last 30 Days':
                        const thirtyDaysAgo = new Date(today);
                        thirtyDaysAgo.setDate(today.getDate() - 30);
                        return normalizedDeliveryDate >= thirtyDaysAgo;
                        
                    case 'This Month':
                        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                        const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                        return deliveryDate >= thisMonthStart && deliveryDate < nextMonthStart;
                        
                    case 'Last Month':
                        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                        const thisMonthStart2 = new Date(now.getFullYear(), now.getMonth(), 1);
                        return deliveryDate >= lastMonthStart && deliveryDate < thisMonthStart2;
                        
                    case 'This Year':
                        const thisYearStart = new Date(now.getFullYear(), 0, 1);
                        const nextYearStart = new Date(now.getFullYear() + 1, 0, 1);
                        return deliveryDate >= thisYearStart && deliveryDate < nextYearStart;
                        
                    default:
                        return true;
                }
            }

            return true;
        });
    }, [deliveries, searchTerm, statusFilter, typeFilter, dateFilter]);

    console.log('Filtered results:', filteredDeliveries.length);

    return {
        filteredDeliveries,
        dateRanges
    };
};