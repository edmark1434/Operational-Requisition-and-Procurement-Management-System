import { useState } from 'react';
import SupplierCard from './SupplierCard';
import {getSupplierCategories, SuggestedVendor} from '../utils/supplierSuggestions';
import {Category, Vendor, CategoryVendor} from "@/pages/tabs/04-Purchases/PurchaseOrderForm";

// Import from correct path

interface SelectSupplierProps {
    formData: {
        SUPPLIER_ID: string;
        ORDER_TYPE?: string;
    };
    selectedSupplier: Vendor | null;
    suggestedSuppliers: SuggestedVendor[];
    suppliersData: Vendor[];
    errors: { [key: string]: string };
    onSupplierChange: (supplierId: string) => void;
    categories: Category[];
    vendorCategories: CategoryVendor[];
}

export default function SelectSupplier({
                                           formData,
                                           selectedSupplier,
                                           suggestedSuppliers,
                                           suppliersData,
                                           errors,
                                           onSupplierChange,
                                           categories,
                                           vendorCategories
                                       }: SelectSupplierProps) {
    const [activeTab, setActiveTab] = useState<'suggested' | 'all'>('suggested');

    const applySuggestion = (supplierId: string) => {
        if (formData.SUPPLIER_ID === supplierId) onSupplierChange('');
        else onSupplierChange(supplierId);
    };

    // Update empty state message based on order type
    const getEmptyStateMessage = () => {
        if (!formData.ORDER_TYPE) {
            return "Please select an order type first to see vendor suggestions";
        }

        if (formData.ORDER_TYPE === 'Items') {
            return "Select an item from a requisition first to see vendor suggestions";
        } else if (formData.ORDER_TYPE === 'Services') {
            return "Select a service from a requisition first to see vendor suggestions";
        }

        return "Select items or services from a requisition first";
    };

    // Helper function to get actual supplier categories
    const getActualSupplierCategories = (supplierId: number) => {
        try {
            return getSupplierCategories(categories, vendorCategories, supplierId, formData.ORDER_TYPE);
        } catch (error) {
            console.error('Error getting vendor categories:', error);
            return [];
        }
    };

    const computeType = (vendor: SuggestedVendor | Vendor) => {
        var displayCategories = [];
        if ('matchingCategories' in vendor) {
            displayCategories = categories
                .filter(c => vendorCategories.filter(vc => vc.vendor_id === vendor.vendor.id)
                    .map(vc => vc.category_id).includes(c.id));
        } else {
            displayCategories = categories
                .filter(c => vendorCategories.filter(vc => vc.vendor_id === vendor.id)
                    .map(vc => vc.category_id).includes(c.id));
        }

        const hasServices = displayCategories.some(cat =>
            categories.filter(c => c.type === 'Services').map(c => c.id).includes(cat.id)
        );

        const hasItems = displayCategories.some(cat =>
            categories.filter(c => c.type === 'Items').map(c => c.id).includes(cat.id)
        );

        if (hasServices && hasItems) return "Mixed Vendor";
        if (hasServices) return "Service Vendor";
        return "Item Vendor";
    };

    const filterVendors = (vendors: Vendor[]) => {
        return vendors
            .filter(vendor => {
                const type = computeType(vendor);

                const typesForItems = ["Item Vendor", "Mixed Vendor"];
                const typesForServices = ["Mixed Vendor", "Service Vendor"];


                const displayTypes = formData.ORDER_TYPE === "Items"
                    ? typesForItems
                    : typesForServices;

                return displayTypes.includes(type);
            })
            .sort((a, b) => {
                const typeA = computeType(a);
                const typeB = computeType(b);

                const itemOrder = {
                    "Item Vendor": 1,
                    "Mixed Vendor": 2,
                    "Service Vendor": 3
                };

                const serviceOrder = {
                    "Service Vendor": 1,
                    "Mixed Vendor": 2,
                    "Item Vendor": 3
                };

                const orderMap = formData.ORDER_TYPE === "Items"
                    ? itemOrder
                    : serviceOrder;

                return orderMap[typeA] - orderMap[typeB];
            })
    }

    const filterSuggestedVendors = (vendors: SuggestedVendor[]) => {
        return vendors
            .filter(vendor => {
                const type = computeType(vendor);

                const typesForItems = ["Item Vendor", "Mixed Vendor"];
                const typesForServices = ["Mixed Vendor", "Service Vendor"];


                const displayTypes = formData.ORDER_TYPE === "Items"
                    ? typesForItems
                    : typesForServices;

                return displayTypes.includes(type);
            })
            .sort((a, b) => {
                if (a.matchPercentage !== b.matchPercentage) {
                    return b.matchPercentage - a.matchPercentage;
                }

                const typeA = computeType(a);
                const typeB = computeType(b);

                const itemOrder = {
                    "Item Vendor": 1,
                    "Mixed Vendor": 2,
                    "Service Vendor": 3
                };

                const serviceOrder = {
                    "Service Vendor": 1,
                    "Mixed Vendor": 2,
                    "Item Vendor": 3
                };

                const orderMap = formData.ORDER_TYPE === "Items"
                    ? itemOrder
                    : serviceOrder;

                return orderMap[typeA] - orderMap[typeB];
            })
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Select Vendor <span className="text-red-500">*</span>
                </h3>
                {formData.SUPPLIER_ID && (
                    <button
                        type="button"
                        onClick={() => onSupplierChange('')}
                        className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                        Clear Selection
                    </button>
                )}
            </div>

            {/* Order Type Requirement */}
            {!formData.ORDER_TYPE && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                            Please select an order type first to see vendor suggestions
                        </p>
                    </div>
                </div>
            )}

            {/* Supplier Tabs */}
            {formData.ORDER_TYPE && (
                <>
                    <div className="flex border-b border-sidebar-border">
                        <button
                            type="button"
                            onClick={() => setActiveTab('suggested')}
                            className={`flex-3 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'suggested'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            💡 Suggested ({suggestedSuppliers.filter(suggestion => suggestion.matchPercentage >= 67).length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('all')}
                            className={`flex-4 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'all'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            All {formData.ORDER_TYPE === 'Items' ? 'Item' : 'Service'} Vendors ({ filterVendors(suppliersData).length })
                        </button>
                    </div>

                    {/* Supplier List */}
                    <div className="max-h-96 overflow-y-auto space-y-3">
                        {activeTab === 'suggested' ? (
                            <>
                                {suggestedSuppliers.filter(suggestion => suggestion.matchPercentage === 100).length > 0 ? (
                                    suggestedSuppliers
                                        .filter(suggestion => suggestion.matchPercentage === 100)
                                        .map((suggestion, index) => (
                                            <SupplierCard
                                                key={suggestion.vendor.id}
                                                supplier={suggestion.vendor}
                                                isSelected={formData.SUPPLIER_ID === suggestion.vendor.id.toString()}
                                                onSelect={() => applySuggestion(suggestion.vendor.id.toString())}
                                                isBestMatch={index === 0 && suggestion.matchPercentage === 100}
                                                matchPercentage={suggestion.matchPercentage}
                                                categories={categories}
                                                matchingCategories={suggestion.matchingCategories}
                                                orderType={formData.ORDER_TYPE}
                                                supplierActualCategories={getActualSupplierCategories(suggestion.vendor.id)}
                                            />
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm text-pretty">{getEmptyStateMessage()}</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {suggestedSuppliers.length > 0 ? (
                                    filterSuggestedVendors(suggestedSuppliers)
                                        .map((suggestion, index) => (
                                            <SupplierCard
                                                key={suggestion.vendor.id}
                                                supplier={suggestion.vendor}
                                                isSelected={formData.SUPPLIER_ID === suggestion.vendor.id.toString()}
                                                onSelect={() => applySuggestion(suggestion.vendor.id.toString())}
                                                isBestMatch={index === 0 && suggestion.matchPercentage === 100}
                                                matchPercentage={suggestion.matchPercentage}
                                                categories={categories}
                                                matchingCategories={suggestion.matchingCategories}
                                                orderType={formData.ORDER_TYPE}
                                                supplierActualCategories={getActualSupplierCategories(suggestion.vendor.id)}
                                            />
                                        ))
                                ) : (
                                    suppliersData.length > 0 ? (
                                        filterVendors(suppliersData).map(vendor => {
                                            // Find if this supplier is in suggestions to show matching categories
                                            const suggestion = suggestedSuppliers.find(s => s.vendor.id === vendor.id);
                                            return (
                                                <SupplierCard
                                                    key={vendor.id}
                                                    supplier={vendor}
                                                    isSelected={formData.SUPPLIER_ID === vendor.id.toString()}
                                                    onSelect={() => applySuggestion(vendor.id.toString())}
                                                    categories={categories}
                                                    matchPercentage={suggestion?.matchPercentage || 0}
                                                    matchingCategories={suggestion?.matchingCategories || []}
                                                    orderType={formData.ORDER_TYPE}
                                                    supplierActualCategories={getActualSupplierCategories(vendor.id)}
                                                />
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-sm">{getEmptyStateMessage()}</p>
                                        </div>
                                    )
                                )}
                            </>
                        )}
                    </div>
                </>
            )}

            {errors.SUPPLIER_ID && (
                <p className="text-red-500 text-xs mt-1">{errors.SUPPLIER_ID}</p>
            )}
        </div>
    );
}
