import { useMemo } from 'react';

export const useServiceFilters = (
    services: any[],
    searchTerm: string,
    categoryFilter: string,
) => {
    const filteredServices = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();

        return services.filter(service => {
            const name = service.name ?? '';
            const description = service.description ?? '';
            const category = service.category ?? '';
            const vendor = service.vendor ?? '';

            const matchesSearch =
                searchTerm === '' ||
                name.toLowerCase().includes(lowerSearch) ||
                description.toLowerCase().includes(lowerSearch) ||
                category.toLowerCase().includes(lowerSearch) ||
                vendor.toLowerCase().includes(lowerSearch);

            const matchesCategory = categoryFilter === 'All' || category === categoryFilter;

            return matchesSearch && matchesCategory;
        });
    }, [services, searchTerm, categoryFilter]);

    const categories = useMemo(() => {
        const uniqueCategories = [...new Set(services.map(service => service.category ?? ''))];
        const nonEmptyCategories = uniqueCategories.filter(c => c !== '');
        return ['All', ...nonEmptyCategories.sort()];
    }, [services]);

    return {
        filteredServices,
        categories,
    };
};
