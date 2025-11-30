import { useMemo } from 'react';

export const useInventoryFilters = (
    inventory: any[],
    searchTerm: string,
    categoryFilter: string,
    statusFilter: string
) => {
    const filteredInventory = useMemo(() => {
        return inventory.filter(item => {
            const matchesSearch = searchTerm === '' ||
                item.NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.BARCODE.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.CATEGORY.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.MAKE_NAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.SUPPLIER_NAME?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = categoryFilter === 'All' || item.CATEGORY === categoryFilter;

            const matchesStatus = statusFilter === 'All' ||
                (statusFilter === 'In Stock' && item.CURRENT_STOCK >= 10) ||
                (statusFilter === 'Low Stock' && item.CURRENT_STOCK > 0 && item.CURRENT_STOCK < 10) ||
                (statusFilter === 'Out of Stock' && item.CURRENT_STOCK === 0);

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [inventory, searchTerm, categoryFilter, statusFilter]);

    const categories = useMemo(() => {
        const uniqueCategories = [...new Set(inventory.map(item => item.CATEGORY))];
        return ['All', ...uniqueCategories.sort()];
    }, [inventory]);

    const statuses = useMemo(() => {
        return ['All', 'In Stock', 'Low Stock', 'Out of Stock'];
    }, []);

    return {
        filteredInventory,
        categories,
        statuses
    };
};
