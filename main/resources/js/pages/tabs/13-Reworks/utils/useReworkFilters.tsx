import { useMemo } from 'react';

export const useReworkFilters = (
    reworks: any[],
    searchTerm: string,
    statusFilter: string
) => {
    const filteredReworks = useMemo(() => {
        return reworks.filter(rework => {
            const matchesSearch = searchTerm === '' ||
                rework.SUPPLIER_NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rework.REMARKS.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rework.STATUS.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rework.SERVICES.some((service: any) =>
                    service.NAME.toLowerCase().includes(searchTerm.toLowerCase())
                );

            const matchesStatus = statusFilter === 'All' || rework.STATUS === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [reworks, searchTerm, statusFilter]);

    const statuses = useMemo(() => {
        const uniqueStatuses = [...new Set(reworks.map(rework => rework.STATUS))];
        return ['All', ...uniqueStatuses.sort()];
    }, [reworks]);

    return {
        filteredReworks,
        statuses
    };
};
