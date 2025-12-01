import {Category, CategoryVendor} from "@/pages/tabs/04-Purchases/PurchaseOrderForm";

interface SupplierCardProps {
    supplier: any;
    isSelected: boolean;
    onSelect: () => void;
    isBestMatch?: boolean;
    matchPercentage?: number;
    categories?: Category[];
    vendorCategories?: CategoryVendor[];
    matchingCategories?: Category[];
    orderType?: string;
    supplierActualCategories?: Category[]; // Add this prop to receive categories from parent
}

export default function SupplierCard({
                                         supplier,
                                         isSelected,
                                         onSelect,
                                         isBestMatch = false,
                                         matchPercentage,
                                         categories = [],
                                         vendorCategories = [],
                                         matchingCategories = [],
                                         orderType = 'items',
                                         supplierActualCategories = [] // Default to empty array
                                     }: SupplierCardProps) {
    // If supplierActualCategories is not provided, use matchingCategories as fallback
    const displayCategories = supplierActualCategories.length > 0 ? supplierActualCategories : matchingCategories;

    // Determine supplier type based on their actual categories
    const getSupplierType = () => {
        const displayCategories2 = displayCategories?.length > 0 ? displayCategories : categories
            .filter(c => vendorCategories.filter(vc => vc.vendor_id === supplier.vendor.id)
                .map(vc => vc.category_id).includes(c.id));

        const hasServices = displayCategories2.some(cat =>
            categories.filter(c => c.type === 'Services').includes(cat)
        );

        const hasItems = displayCategories2.some(cat =>
            categories.filter(c => c.type === 'Items').includes(cat)
        );

        if (hasServices && hasItems) {
            return { type: 'Mixed Vendor', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' };
        } if (hasServices) {
            return { type: 'Service Vendor', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' };
        } else {
            return { type: 'Item Vendor', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' };
        }
    };

    const supplierType = getSupplierType();

    return (
        <div
            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800'
                    : 'border-sidebar-border bg-white dark:bg-sidebar hover:border-blue-300 hover:bg-blue-25 dark:hover:bg-blue-900/10'
            }`}
            onClick={onSelect}
        >
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white truncate">
                            {supplier.name || ''}
                        </span>
                        {isBestMatch && (
                            <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full font-medium shrink-0">
                                🏆 Best
                            </span>
                        )}
                        <span className={`px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full shrink-0 ${matchPercentage !== undefined && matchPercentage < 67 ? 'bg-gray-10 dark:bg-gray-800' : ''}`}>
                            {matchPercentage?.toFixed() || 0}%
                        </span>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-2">
                        {supplier.email}
                    </p>

                    {/* Supplier Type Indicator */}
                    <div className="mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${supplierType?.color || ''}`}>
                            {supplierType?.type || ''}
                        </span>
                    </div>

                    {/* Actual Supplier Categories */}
                    <div className="mb-2">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {orderType === 'services' ? 'Service Categories:' : 'Item Categories:'}
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {displayCategories.map((category, index) => {
                                const isMatch = matchingCategories.includes(category);
                                return (
                                    <span
                                        key={index}
                                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs ${
                                            isMatch
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                        }`}
                                    >
                                        {category.name}
                                    </span>
                                );
                            })}
                        </div>
                        {displayCategories.length === 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                No {orderType === 'services' ? 'service' : 'item'} categories available
                            </p>
                        )}
                    </div>

                    {/* Payment Methods */}
                    <div className="flex flex-wrap gap-1">
                        {supplier.ALLOWS_CASH && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Cash
                            </span>
                        )}
                        {supplier.ALLOWS_DISBURSEMENT && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                Disbursement
                            </span>
                        )}
                        {supplier.ALLOWS_STORE_CREDIT && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                Store Credit
                            </span>
                        )}
                    </div>
                </div>

                {isSelected && (
                    <div className="text-blue-600 dark:text-blue-400 ml-2 shrink-0">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
}
