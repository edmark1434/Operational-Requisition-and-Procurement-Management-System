import suppliersData from '@/pages/datasets/supplier';
import categorySuppliersData from '@/pages/datasets/category_supplier';
import categoriesData from '@/pages/datasets/category';

export interface SuggestedSupplier {
    supplier: any;
    matchScore: number;
    matchingCategories: string[];
    matchPercentage: number;
    categoryIds: number[];
}

export const getSuggestedSuppliers = (items: any[]): SuggestedSupplier[] => {
    if (!items || items.length === 0) return [];

    // Get all unique category IDs from selected items
    const itemCategoryIds = [...new Set(items
        .filter(item => item.SELECTED)
        .map(item => item.CATEGORY_ID) // ✅ Now using CATEGORY_ID
        .filter(Boolean)
    )];

    const totalCategories = itemCategoryIds.length;

    if (totalCategories === 0) return [];

    const suggestions: SuggestedSupplier[] = suppliersData.map(supplier => {
        // Find all categories this supplier serves from category_supplier table
        const supplierCategoryIds = categorySuppliersData
            .filter(cs => cs.SUPPLIER_ID === supplier.ID)
            .map(cs => cs.CATEGORY_ID);

        // Find matching categories
        const matchingCategoryIds = itemCategoryIds.filter(categoryId =>
            supplierCategoryIds.includes(categoryId)
        );

        // Get unique category names for display
        const matchingCategories = [...new Set(matchingCategoryIds.map(categoryId => {
            const category = categoriesData.find(cat => cat.CAT_ID === categoryId);
            return category?.NAME || `Category ${categoryId}`;
        }))];

        const matchScore = matchingCategoryIds.length * 10;
        const matchPercentage = Math.round((matchingCategoryIds.length / totalCategories) * 100);

        return {
            supplier,
            matchScore,
            matchingCategories,
            matchPercentage,
            categoryIds: matchingCategoryIds
        };
    });

    // Return suppliers with at least one match, sorted by best match
    // Remove duplicates and ensure unique suppliers
    const uniqueSuggestions = suggestions
        .filter(suggestion => suggestion.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore);

    return uniqueSuggestions;
};

export const getBestSupplier = (items: any[]): SuggestedSupplier | null => {
    const suggestions = getSuggestedSuppliers(items);
    return suggestions.length > 0 ? suggestions[0] : null;
};
