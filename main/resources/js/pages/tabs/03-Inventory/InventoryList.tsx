import { Link } from '@inertiajs/react';
import { StatusIcons } from './utils/icons';
import { getStockStatusColor, getCategoryColor } from './utils/styleUtils';
import { formatCurrency } from './utils/formatters';

interface InventoryListProps {
    inventory: any[];
    onItemClick: (item: any, editing?: boolean) => void;
    viewMode: 'comfortable' | 'compact' | 'condensed';
}

export default function InventoryList({ inventory, onItemClick, viewMode }: InventoryListProps) {
    if (inventory.length === 0) {
        return (
            <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border bg-sidebar dark:bg-sidebar">
                <div className="h-full overflow-y-auto">
                    <div className="p-4 text-center py-12">
                        <div className="text-gray-400 dark:text-gray-600 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No inventory items found</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your search or filters.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (viewMode === 'condensed') {
        return (
            <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border bg-sidebar dark:bg-sidebar">
                <div className="h-full overflow-y-auto">
                    <div className="p-4">
                        <div className="space-y-2">
                            {inventory.map((item) => (
                                <CondensedListItem
                                    key={item.ID}
                                    item={item}
                                    onClick={() => onItemClick(item)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border bg-sidebar dark:bg-sidebar">
            <div className="h-full overflow-y-auto p-4">
                <div className={`grid gap-4 ${
                    viewMode === 'comfortable'
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6'
                }`}>
                    {inventory.map((item) => (
                        <InventoryCard
                            key={item.ID}
                            item={item}
                            onClick={() => onItemClick(item)}
                            viewMode={viewMode}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Condensed List Item Component
function CondensedListItem({ item, onClick }: {
    item: any;
    onClick: () => void;
}) {
    const stockStatus = item.CURRENT_STOCK === 0 ? 'out-of-stock' :
        item.CURRENT_STOCK < 10 ? 'low-stock' : 'in-stock';

    return (
        <div className="border border-sidebar-border rounded-lg bg-white dark:bg-sidebar-accent p-3 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between">
                {/* Left Section - Basic Info */}
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                    <div className="flex-shrink-0">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-sidebar px-2 py-1 rounded">
                            #{item.ID}
                        </span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                            <h3
                                className="text-sm font-medium text-gray-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                                onClick={onClick}
                            >
                                {item.NAME}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(item.CATEGORY)}`}>
                                {item.CATEGORY}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                {item.BARCODE}
                            </span>
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getStockStatusColor(stockStatus)}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                {stockStatus === 'out-of-stock' ? 'Out of Stock' : stockStatus === 'low-stock' ? 'Low Stock' : 'In Stock'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle Section - Stock and Price */}
                <div className="flex items-center space-x-6 mr-4">
                    <div className="text-center">
                        <div className={`text-sm font-semibold ${
                            item.CURRENT_STOCK === 0 ? 'text-red-600 dark:text-red-400' :
                                item.CURRENT_STOCK < 10 ? 'text-orange-600 dark:text-orange-400' :
                                    'text-green-600 dark:text-green-400'
                        }`}>
                            {item.CURRENT_STOCK}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Qty</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(item.UNIT_PRICE)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Price</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatCurrency(item.CURRENT_STOCK * item.UNIT_PRICE)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                    </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex items-center space-x-2">
                    {item.CURRENT_STOCK === 0 ? (
                        <Link
                            href="/requisitionform"
                            className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1.5 px-3 rounded-md flex items-center gap-1 transition-colors whitespace-nowrap"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Order Now
                        </Link>
                    ) : (
                        <button
                            onClick={onClick}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium whitespace-nowrap"
                        >
                            View Details
                        </button>
                    )}
                    <Link
                        href={`/inventory/${item.ID}/edit`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}

// Inventory Card Component for Comfortable and Compact views
function InventoryCard({ item, onClick, viewMode }: {
    item: any;
    onClick: () => void;
    viewMode: 'comfortable' | 'compact';
}) {
    const stockStatus = item.CURRENT_STOCK === 0 ? 'out-of-stock' :
        item.CURRENT_STOCK < 10 ? 'low-stock' : 'in-stock';

    const stockStatusText = stockStatus === 'in-stock' ? 'In Stock' :
        stockStatus === 'low-stock' ? 'Low Stock' : 'Out of Stock';

    if (viewMode === 'compact') {
        return (
            <div className="border border-sidebar-border rounded-lg bg-white dark:bg-sidebar-accent p-3 hover:shadow-md transition-all duration-200 cursor-pointer group">
                {/* Compact Header */}
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        #{item.ID}
                    </span>
                    <Link
                        href={`/inventory/${item.ID}/edit`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </Link>
                </div>

                {/* Item Name - Compact */}
                <h3
                    className="font-medium text-sm text-gray-900 dark:text-white mb-1 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={onClick}
                >
                    {item.NAME}
                </h3>

                {/* Category - Compact */}
                <div className="mb-2">
                    <span className="inline-block px-1.5 py-0.5 rounded text-xs bg-gray-100 dark:bg-sidebar text-gray-600 dark:text-gray-400">
                        {item.CATEGORY}
                    </span>
                </div>

                {/* Stock and Price - Compact */}
                <div className="space-y-1">
                    <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${getStockStatusColor(stockStatus)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {stockStatus === 'out-of-stock' ? 'Out' : stockStatus === 'low-stock' ? 'Low' : 'In Stock'}
                    </div>

                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Qty:</span>
                        <span className={`font-semibold ${
                            item.CURRENT_STOCK === 0 ? 'text-red-600 dark:text-red-400' :
                                item.CURRENT_STOCK < 10 ? 'text-orange-600 dark:text-orange-400' :
                                    'text-green-600 dark:text-green-400'
                        }`}>
                            {item.CURRENT_STOCK}
                        </span>
                    </div>

                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Price:</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {formatCurrency(item.UNIT_PRICE)}
                        </span>
                    </div>
                </div>

                {/* Order Now Button for Out of Stock */}
                {item.CURRENT_STOCK === 0 && (
                    <div className="mt-2 pt-2 border-t border-sidebar-border">
                        <Link
                            href="/requisitionform"
                            className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1.5 px-2 rounded-md flex items-center justify-center gap-1 transition-colors"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Order Now
                        </Link>
                    </div>
                )}
            </div>
        );
    }

    // Comfortable View (Original Card Layout)
    return (
        <div className="border border-sidebar-border rounded-lg bg-white dark:bg-sidebar-accent p-4 hover:shadow-md transition-all duration-200 cursor-pointer group">
            {/* Header with ID and Actions */}
            <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-sidebar px-2 py-1 rounded">
                    #{item.ID}
                </span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Link
                        href={`/inventory/${item.ID}/edit`}
                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* Item Name */}
            <h3
                className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400"
                onClick={onClick}
            >
                {item.NAME}
            </h3>

            {/* Barcode */}
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4M6 20h2M16 4h2m0 16h2M6 4h2" />
                </svg>
                {item.BARCODE}
            </div>

            {/* Category Badge */}
            <div className="mb-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.CATEGORY)}`}>
                    {item.CATEGORY}
                </span>
            </div>

            {/* Stock and Price Info */}
            <div className="space-y-2">
                {/* Stock Status */}
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStockStatusColor(stockStatus)}`}>
                    {StatusIcons[stockStatus as keyof typeof StatusIcons]}
                    {stockStatusText}
                </div>

                {/* Stock Quantity */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Quantity:</span>
                    <span className={`text-sm font-semibold ${
                        item.CURRENT_STOCK === 0 ? 'text-red-600 dark:text-red-400' :
                            item.CURRENT_STOCK < 10 ? 'text-orange-600 dark:text-orange-400' :
                                'text-green-600 dark:text-green-400'
                    }`}>
                        {item.CURRENT_STOCK} units
                    </span>
                </div>

                {/* Unit Price */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Unit Price:</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(item.UNIT_PRICE)}
                    </span>
                </div>

                {/* Total Value */}
                <div className="flex justify-between items-center pt-2 border-t border-sidebar-border">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Value:</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatCurrency(item.CURRENT_STOCK * item.UNIT_PRICE)}
                    </span>
                </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-4 pt-3 border-t border-sidebar-border flex justify-between items-center">
                <button
                    onClick={onClick}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                    View Details
                </button>

                {item.CURRENT_STOCK === 0 ? (
                    <Link
                        href="/requisitionform"
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1.5 px-3 rounded-md flex items-center gap-1 transition-colors"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Order Now
                    </Link>
                ) : (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.CURRENT_STOCK > 0 && item.CURRENT_STOCK < 10 && (
                            <span className="text-orange-500 dark:text-orange-400">⚠️ Low</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
