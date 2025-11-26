import { useMemo } from 'react';

export const useMakesCategoriesFilters = (
    makes: any[],
    categories: any[],
    makesSearchTerm: string,
    categoriesSearchTerm: string
) => {
    const filteredMakes = useMemo(() => {
        return makes.filter(make => {
            return makesSearchTerm === '' ||
                make.NAME.toLowerCase().includes(makesSearchTerm.toLowerCase());
        });
    }, [makes, makesSearchTerm]);

    const filteredCategories = useMemo(() => {
        return categories.filter(category => {
            return categoriesSearchTerm === '' ||
                category.NAME.toLowerCase().includes(categoriesSearchTerm.toLowerCase()) ||
                category.DESCRIPTION.toLowerCase().includes(categoriesSearchTerm.toLowerCase()) ||
                category.TYPE.toLowerCase().includes(categoriesSearchTerm.toLowerCase());
        });
    }, [categories, categoriesSearchTerm]);

    return {
        filteredMakes,
        filteredCategories
    };
};
