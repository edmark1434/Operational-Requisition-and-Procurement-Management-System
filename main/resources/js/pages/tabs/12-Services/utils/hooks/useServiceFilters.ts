import { useMemo } from 'react';

export const useServiceFilters = (
    services: any[],
    searchTerm: string,
    categoryFilter: string,
    statusFilter: string
) => {
    const filteredServices = useMemo(() => {
        return services.filter(service => {
            const matchesSearch = searchTerm === '' ||
                service.NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
                service.DESCRIPTION.toLowerCase().includes(searchTerm.toLowerCase()) ||
                service.CATEGORY.toLowerCase().includes(searchTerm.toLowerCase()) ||
                service.VENDOR_NAME.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = categoryFilter === 'All' || service.CATEGORY === categoryFilter;

            const matchesStatus = statusFilter === 'All' ||
                (statusFilter === 'Active' && service.IS_ACTIVE) ||
                (statusFilter === 'Inactive' && !service.IS_ACTIVE);

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [services, searchTerm, categoryFilter, statusFilter]);

    const categories = useMemo(() => {
        const uniqueCategories = [...new Set(services.map(service => service.CATEGORY))];
        return ['All', ...uniqueCategories.sort()];
    }, [services]);

    const statuses = useMemo(() => {
        return ['All', 'Active', 'Inactive'];
    }, []);

    return {
        filteredServices,
        categories,
        statuses
    };
};
