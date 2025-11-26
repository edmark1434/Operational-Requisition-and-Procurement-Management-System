import suppliersData from '@/pages/datasets/supplier';
import categorySuppliersData from '@/pages/datasets/category_supplier';
import categoriesData from '@/pages/datasets/category';

export interface SuggestedSupplier {
    supplier: any;
    matchScore: number;
    matchingCategories: string[];
    matchPercentage: number;
    categoryIds: number[];
    isSpecialized: boolean;
}

export const getSuggestedSuppliers = (items: any[], services: any[], orderType?: string): SuggestedSupplier[] => {
    // If no items or services selected, return empty
    const selectedItems = items?.filter(item => item.SELECTED) || [];
    const selectedServices = services?.filter(service => service.SELECTED) || [];

    if ((!selectedItems || selectedItems.length === 0) && (!selectedServices || selectedServices.length === 0)) {
        return [];
    }

    let categoryIds: number[] = [];
    let selectedCategories: string[] = [];

    // Get category IDs and names based on order type and selected items/services
    if (orderType === 'items' && selectedItems.length > 0) {
        // For items: use CATEGORY_ID from items
        categoryIds = [...new Set(selectedItems
            .map(item => item.CATEGORY_ID)
            .filter(Boolean)
        )];

        // Get category names for display
        selectedCategories = categoryIds.map(categoryId => {
            const category = categoriesData.find(cat => cat.CAT_ID === categoryId);
            return category?.NAME || `Category ${categoryId}`;
        });
    } else if (orderType === 'services' && selectedServices.length > 0) {
        // For services: use CATEGORY_ID from services
        categoryIds = [...new Set(selectedServices
            .map(service => service.CATEGORY_ID)
            .filter(Boolean)
        )];

        // Get category names for display
        selectedCategories = categoryIds.map(categoryId => {
            const category = categoriesData.find(cat => cat.CAT_ID === categoryId);
            return category?.NAME || `Category ${categoryId}`;
        });
    }

    const totalCategories = categoryIds.length;

    if (totalCategories === 0) return [];

    const suggestions: SuggestedSupplier[] = suppliersData.map(supplier => {
        // Find all categories this supplier serves from category_supplier table
        const supplierCategoryIds = categorySuppliersData
            .filter(cs => cs.SUPPLIER_ID === supplier.ID)
            .map(cs => cs.CATEGORY_ID);

        // Find matching categories
        const matchingCategoryIds = categoryIds.filter(categoryId =>
            supplierCategoryIds.includes(categoryId)
        );

        // Get unique category names for display (only the ones this supplier actually provides)
        const matchingCategories = [...new Set(matchingCategoryIds.map(categoryId => {
            const category = categoriesData.find(cat => cat.CAT_ID === categoryId);
            return category?.NAME || `Category ${categoryId}`;
        }))];

        // Calculate match score with specialization bonus
        let matchScore = matchingCategoryIds.length * 10;

        // Check if supplier is specialized in the required service/item types
        const isSpecialized = checkSupplierSpecialization(supplier.ID, categoryIds, orderType);

        // Add bonus for specialized suppliers
        if (isSpecialized) {
            matchScore += 20;
        }

        const matchPercentage = Math.round((matchingCategoryIds.length / totalCategories) * 100);

        return {
            supplier,
            matchScore,
            matchingCategories,
            matchPercentage,
            categoryIds: matchingCategoryIds,
            isSpecialized
        };
    });

    // Return suppliers with at least one match, sorted by best match
    const uniqueSuggestions = suggestions
        .filter(suggestion => suggestion.matchScore > 0)
        .sort((a, b) => {
            // First sort by match score
            if (b.matchScore !== a.matchScore) {
                return b.matchScore - a.matchScore;
            }
            // Then by specialization
            if (b.isSpecialized !== a.isSpecialized) {
                return b.isSpecialized ? 1 : -1;
            }
            // Finally by match percentage
            return b.matchPercentage - a.matchPercentage;
        });

    return uniqueSuggestions;
};

// Helper function to check if supplier is specialized in the required categories
const checkSupplierSpecialization = (supplierId: number, requiredCategoryIds: number[], orderType?: string): boolean => {
    const supplierCategoryIds = categorySuppliersData
        .filter(cs => cs.SUPPLIER_ID === supplierId)
        .map(cs => cs.CATEGORY_ID);

    // Get all categories of the same type (item or service)
    const allCategoriesOfType = categoriesData
        .filter(cat => orderType === 'services' ? cat.TYPE === 'service' : cat.TYPE === 'item')
        .map(cat => cat.CAT_ID);

    // Calculate what percentage of supplier's categories match the required type
    const supplierCategoriesOfType = supplierCategoryIds.filter(id =>
        allCategoriesOfType.includes(id)
    ).length;

    const totalSupplierCategories = supplierCategoryIds.length;

    // If supplier has mostly categories of the required type, consider them specialized
    if (totalSupplierCategories > 0) {
        const specializationRatio = supplierCategoriesOfType / totalSupplierCategories;
        return specializationRatio > 0.7; // 70% or more of their categories match the required type
    }

    return false;
};

// Helper function to get supplier's actual categories for display
export const getSupplierCategories = (supplierId: number, orderType?: string): string[] => {
    const supplierCategoryIds = categorySuppliersData
        .filter(cs => cs.SUPPLIER_ID === supplierId)
        .map(cs => cs.CATEGORY_ID);

    const supplierCategories = supplierCategoryIds.map(categoryId => {
        const category = categoriesData.find(cat => cat.CAT_ID === categoryId);
        return category?.NAME || `Category ${categoryId}`;
    });

    // Filter by type if orderType is specified
    if (orderType) {
        return supplierCategories.filter(categoryName => {
            const category = categoriesData.find(cat => cat.NAME === categoryName);
            if (!category) return false;

            if (orderType === 'services') {
                return category.TYPE === 'service';
            } else {
                return category.TYPE === 'item';
            }
        });
    }

    return supplierCategories;
};

export const getBestSupplier = (items: any[], services: any[], orderType?: string): SuggestedSupplier | null => {
    const suggestions = getSuggestedSuppliers(items, services, orderType);
    return suggestions.length > 0 ? suggestions[0] : null;
};
