import { useMemo } from 'react';

export const useReturnsFilters = (
    returns: any[],
    searchTerm: string,
    statusFilter: string,
    dateFilter: string
) => {
    const filteredReturns = useMemo(() => {
        return returns.filter(returnItem => {
            const matchesSearch = searchTerm === '' ||
                returnItem.REFERENCE_NO?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                returnItem.DELIVERY_REFERENCE?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                returnItem.SUPPLIER_NAME?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'All' || returnItem.STATUS === statusFilter;

            const matchesDate = dateFilter === 'All' ||
                (dateFilter === 'Today' && isToday(returnItem.CREATED_AT)) ||
                (dateFilter === 'This Week' && isThisWeek(returnItem.CREATED_AT)) ||
                (dateFilter === 'This Month' && isThisMonth(returnItem.CREATED_AT));

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [returns, searchTerm, statusFilter, dateFilter]);

    const statuses = useMemo(() => {
        const uniqueStatuses = [...new Set(returns.map(item => item.STATUS))];
        return ['All', ...uniqueStatuses];
    }, [returns]);

    const dateRanges = useMemo(() => {
        return ['All', 'Today', 'This Week', 'This Month'];
    }, []);

    return {
        filteredReturns,
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
