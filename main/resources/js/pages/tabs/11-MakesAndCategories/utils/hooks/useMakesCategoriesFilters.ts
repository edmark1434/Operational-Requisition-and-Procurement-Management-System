// utils/hooks/useMakesCategoriesFilters.ts
import { useMemo } from 'react';

export const useMakesCategoriesFilters = (
    makes: any[],
    categories: any[],
    makesSearchTerm: string,
    categoriesSearchTerm: string,
    makeStatusFilter: 'all' | 'active' | 'inactive' = 'all',
    categoryTypeFilter: 'all' | 'item' | 'service' = 'all'
) => {
    const filteredMakes = useMemo(() => {
        return makes.filter(make => {
            const matchesSearch = makesSearchTerm === '' ||
                make.NAME.toLowerCase().includes(makesSearchTerm.toLowerCase());

            const matchesStatus = makeStatusFilter === 'all' ||
                (makeStatusFilter === 'active' && make.IS_ACTIVE) ||
                (makeStatusFilter === 'inactive' && !make.IS_ACTIVE);

            return matchesSearch && matchesStatus;
        });
    }, [makes, makesSearchTerm, makeStatusFilter]);

    const filteredCategories = useMemo(() => {
        return categories.filter(category => {
            const matchesSearch = categoriesSearchTerm === '' ||
                category.NAME.toLowerCase().includes(categoriesSearchTerm.toLowerCase()) ||
                category.DESCRIPTION.toLowerCase().includes(categoriesSearchTerm.toLowerCase());

            const matchesType = categoryTypeFilter === 'all' ||
                category.TYPE === categoryTypeFilter;

            return matchesSearch && matchesType;
        });
    }, [categories, categoriesSearchTerm, categoryTypeFilter]);

    return {
        filteredMakes,
        filteredCategories
    };
};
