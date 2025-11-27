import { useState } from 'react';
import SupplierCard from './SupplierCard';
import { getSupplierCategories } from '../utils/supplierSuggestions';// Import from correct path

interface SelectSupplierProps {
    formData: {
        SUPPLIER_ID: string;
        ORDER_TYPE?: string;
    };
    selectedSupplier: any;
    suggestedSuppliers: any[];
    suppliersData: any[];
    errors: { [key: string]: string };
    onSupplierChange: (supplierId: string) => void;
}

export default function SelectSupplier({
                                           formData,
                                           selectedSupplier,
                                           suggestedSuppliers,
                                           suppliersData,
                                           errors,
                                           onSupplierChange
                                       }: SelectSupplierProps) {
    const [activeTab, setActiveTab] = useState<'suggested' | 'all'>('suggested');

    const applySuggestion = (supplierId: string) => {
        onSupplierChange(supplierId);
    };

    // Update empty state message based on order type
    const getEmptyStateMessage = () => {
        if (!formData.ORDER_TYPE) {
            return "Please select an order type first to see supplier suggestions";
        }

        if (formData.ORDER_TYPE === 'items') {
            return "Select items from a requisition first to see supplier suggestions";
        } else if (formData.ORDER_TYPE === 'services') {
            return "Select services from a requisition first to see supplier suggestions";
        }

        return "Select items or services from a requisition first";
    };

    // Helper function to get actual supplier categories
    const getActualSupplierCategories = (supplierId: number) => {
        try {
            return getSupplierCategories(supplierId, formData.ORDER_TYPE);
        } catch (error) {
            console.error('Error getting supplier categories:', error);
            return [];
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Select Supplier <span className="text-red-500">*</span>
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
                            Please select an Order Type first to see supplier suggestions
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
                            className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'suggested'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            💡 Suggested ({suggestedSuppliers.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('all')}
                            className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'all'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            All Suppliers ({suppliersData.length})
                        </button>
                    </div>

                    {/* Supplier List */}
                    <div className="max-h-96 overflow-y-auto space-y-3">
                        {activeTab === 'suggested' ? (
                            <>
                                {suggestedSuppliers.length > 0 ? (
                                    suggestedSuppliers.map((suggestion, index) => (
                                        <SupplierCard
                                            key={suggestion.supplier.ID}
                                            supplier={suggestion.supplier}
                                            isSelected={formData.SUPPLIER_ID === suggestion.supplier.ID.toString()}
                                            onSelect={() => applySuggestion(suggestion.supplier.ID.toString())}
                                            isBestMatch={index === 0}
                                            matchPercentage={suggestion.matchPercentage}
                                            matchingCategories={suggestion.matchingCategories}
                                            orderType={formData.ORDER_TYPE}
                                            supplierActualCategories={getActualSupplierCategories(suggestion.supplier.ID)}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm">{getEmptyStateMessage()}</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            suppliersData.map(supplier => {
                                // Find if this supplier is in suggestions to show matching categories
                                const suggestion = suggestedSuppliers.find(s => s.supplier.ID === supplier.ID);
                                return (
                                    <SupplierCard
                                        key={supplier.ID}
                                        supplier={supplier}
                                        isSelected={formData.SUPPLIER_ID === supplier.ID.toString()}
                                        onSelect={() => applySuggestion(supplier.ID.toString())}
                                        matchPercentage={suggestion?.matchPercentage || 0}
                                        matchingCategories={suggestion?.matchingCategories || []}
                                        orderType={formData.ORDER_TYPE}
                                        supplierActualCategories={getActualSupplierCategories(supplier.ID)}
                                    />
                                );
                            })
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
