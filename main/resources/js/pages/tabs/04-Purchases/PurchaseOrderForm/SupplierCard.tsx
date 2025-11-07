interface SupplierCardProps {
    supplier: any;
    isSelected: boolean;
    onSelect: () => void;
    isBestMatch?: boolean;
    matchPercentage?: number;
    matchingCategories?: string[];
}

export default function SupplierCard({
                                         supplier,
                                         isSelected,
                                         onSelect,
                                         isBestMatch = false,
                                         matchPercentage = 0,
                                         matchingCategories = []
                                     }: SupplierCardProps) {
    // Get all available categories for this supplier from the dataset
    const supplierCategories = ['Electrical', 'Consumables', 'Tools', 'Parts', 'Equipment', 'Office Supplies'];

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
                            {supplier.NAME}
                        </span>
                        {isBestMatch && (
                            <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full font-medium shrink-0">
                                🏆 Best
                            </span>
                        )}
                        {matchPercentage > 0 && (
                            <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full shrink-0">
                                {matchPercentage}%
                            </span>
                        )}
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-2">
                        {supplier.EMAIL}
                    </p>

                    {/* All Categories with Color Coding */}
                    <div className="mb-2">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Categories:</p>
                        <div className="flex flex-wrap gap-1">
                            {supplierCategories.map((category, index) => {
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
                                        {isMatch ? '✅ ' : '📦 '}{category}
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="flex flex-wrap gap-1">
                        {supplier.ALLOWS_CASH && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                💵 Cash
                            </span>
                        )}
                        {supplier.ALLOWS_DISBURSEMENT && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                🏦 Disbursement
                            </span>
                        )}
                        {supplier.ALLOWS_STORE_CREDIT && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                💳 Store Credit
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
