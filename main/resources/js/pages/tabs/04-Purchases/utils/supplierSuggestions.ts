import suppliersData from '@/pages/datasets/supplier';
import categorySuppliersData from '@/pages/datasets/category_supplier';
import categoriesData from '@/pages/datasets/category';
import {
    Category,
    CategoryVendor,
    RequisitionItem,
    RequisitionService,
    Vendor
} from "@/pages/tabs/04-Purchases/PurchaseOrderForm";
import categories from "@/pages/datasets/category";

export interface SuggestedVendor {
    vendor: any;
    matchingCategories: Category[];
    matchPercentage: number;
}

export const getSuggestedSuppliers = (items: RequisitionItem[], services: RequisitionService[], vendors: Vendor[], categories: Category[], vendorCategories: CategoryVendor[] , orderType?: string,): SuggestedVendor[] => {
    // If no items or services selected, return empty
    const selectedItems = items;
    const selectedServices = services;

    if ((!selectedItems || selectedItems.length === 0) && (!selectedServices || selectedServices.length === 0)) {
        return [];
    }

    let categoryIds: number[] = [];

    // Get category IDs and names based on order type and selected items/services
    if (orderType === 'Items' && selectedItems.length > 0) {
        // For items: use CATEGORY_ID from items
        categoryIds = [...new Set(selectedItems
            .map(item => item.item.category_id)
        )];

    } else if (orderType === 'Services' && selectedServices.length > 0) {
        // For services: use CATEGORY_ID from services
        categoryIds = [...new Set(selectedServices
            .map(service => service.service.category_id)
        )];
    }

    const totalCategories = categoryIds.length;
    if (totalCategories === 0) return [];

    const suggestions: SuggestedVendor[] = vendors.map(vendor => {
        // Find all categories this supplier serves from category_supplier table
        const supplierCategoryIds = vendorCategories
            .filter(cs => cs.vendor_id === vendor.id)
            .map(cs => cs.category_id);

        // Find matching categories
        const matchingCategories = categories
            .filter(category => supplierCategoryIds.includes(category.id))
            .filter(category => categoryIds.includes(category.id));
        const matchPercentage = Math.round((matchingCategories.length / totalCategories) * 100);

        return {
            vendor,
            matchingCategories,
            matchPercentage,
        };
    });

    return suggestions.sort((a, b) => b.matchPercentage - a.matchPercentage);
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
export const getSupplierCategories = (categories: Category[], vendorCategories: CategoryVendor[], supplierId: number, orderType?: string): Category[] => {
    const supplierCategoryIds = vendorCategories
        .filter(cs => cs.vendor_id === supplierId)
        .map(cs => cs.category_id);

    return categories
        .filter(c => supplierCategoryIds.includes(c.id))
};
