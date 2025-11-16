import { useMemo } from 'react';

export const useDeliveriesFilters = (
    deliveries: any[],
    searchTerm: string,
    statusFilter: string,
    dateFilter: string
) => {
    const filteredDeliveries = useMemo(() => {
        return deliveries.filter(delivery => {
            const matchesSearch = searchTerm === '' ||
                delivery.RECEIPT_NO?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                delivery.SUPPLIER_NAME?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'All' || delivery.STATUS === statusFilter;

            const matchesDate = dateFilter === 'All' ||
                (dateFilter === 'Today' && isToday(delivery.DELIVERY_DATE)) ||
                (dateFilter === 'This Week' && isThisWeek(delivery.DELIVERY_DATE)) ||
                (dateFilter === 'This Month' && isThisMonth(delivery.DELIVERY_DATE));

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [deliveries, searchTerm, statusFilter, dateFilter]);

    const statuses = useMemo(() => {
        const uniqueStatuses = [...new Set(deliveries.map(item => item.STATUS))];
        return ['All', ...uniqueStatuses];
    }, [deliveries]);

    const dateRanges = useMemo(() => {
        return ['All', 'Today', 'This Week', 'This Month'];
    }, []);

    return {
        filteredDeliveries,
        statuses,
        dateRanges
    };
};

// Helper functions
const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
};

const isThisWeek = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    return date >= startOfWeek && date <= endOfWeek;
};

const isThisMonth = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};
