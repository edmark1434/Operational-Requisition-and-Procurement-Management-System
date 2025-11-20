import { Link } from '@inertiajs/react';
import { StatusIcons } from './utils/icons';
import { getStockStatusColor, getCategoryColor } from './utils/styleUtils';
import { formatCurrency } from './utils/formatters';
import { LoaderCircle, Package, Edit, ShoppingCart } from 'lucide-react';

interface InventoryListProps {
    inventory: any[];
    onItemClick: (item: any, editing?: boolean) => void;
    viewMode: 'comfortable' | 'compact' | 'condensed';
    isLoading?: boolean;
}

export default function InventoryList({ inventory, onItemClick, viewMode, isLoading = false }: InventoryListProps) {
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-8">
                <div className="flex items-center justify-center">
                    <LoaderCircle className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">Loading inventory...</span>
                </div>
            </div>
        );
    }

    if (inventory.length === 0) {
        return (
            <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border bg-sidebar dark:bg-sidebar">
                <div className="h-full overflow-y-auto">
                    <div className="p-4 text-center py-12">
                        <div className="text-gray-400 dark:text-gray-600 mb-4">
                            <Package className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No inventory items found</h3>
                        <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (viewMode === 'condensed') {
        return (
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-sidebar border-b border-sidebar-border text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="col-span-3">Item</div>
                    <div className="col-span-2">Category</div>
                    <div className="col-span-1 text-center">Stock</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Unit Price</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-sidebar-border">
                    {inventory.map((item) => {
                        const stockStatus = item.CURRENT_STOCK === 0 ? 'out-of-stock' :
                            item.CURRENT_STOCK < 10 ? 'low-stock' : 'in-stock';

                        const stockStatusText = stockStatus === 'in-stock' ? 'In Stock' :
                            stockStatus === 'low-stock' ? 'Low Stock' : 'Out of Stock';

                        return (
                            <div
                                key={item.ID}
                                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-sidebar transition-colors cursor-pointer"
                                onClick={() => onItemClick(item)}
                            >
                                {/* Item Info */}
                                <div className="col-span-3 flex items-center space-x-3">
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {item.NAME}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            #{item.ID} • {item.BARCODE}
                                        </div>
                                    </div>
                                </div>

                                {/* Category */}
                                <div className="col-span-2 flex items-center">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.CATEGORY)}`}>
                                        {item.CATEGORY}
                                    </span>
                                </div>

                                {/* Stock Quantity - Color Coded */}
                                <div className="col-span-1 flex items-center justify-center">
                                    <span className={`text-sm font-semibold ${
                                        item.CURRENT_STOCK === 0
                                            ? 'text-red-600 dark:text-red-400'
                                            : item.CURRENT_STOCK < 10
                                                ? 'text-orange-600 dark:text-orange-400'
                                                : 'text-green-600 dark:text-green-400'
                                    }`}>
                                        {item.CURRENT_STOCK}
                                    </span>
                                </div>

                                {/* Status */}
                                <div className="col-span-2 flex items-center">
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStockStatusColor(stockStatus)}`}>
                                        {StatusIcons[stockStatus as keyof typeof StatusIcons]}
                                        {stockStatusText}
                                    </div>
                                </div>

                                {/* Unit Price */}
                                <div className="col-span-2 flex items-center justify-end">
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                        {formatCurrency(item.UNIT_PRICE)}
                                    </span>
                                </div>

                                {/* Actions - Cart first, then Edit (swapped positions) */}
                                <div className="col-span-2 flex items-center justify-end space-x-2">
                                    {item.CURRENT_STOCK === 0 && (
                                        <Link
                                            href="/requisitionform"
                                            onClick={(e) => e.stopPropagation()}
                                            className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1.5 px-2 rounded-md transition-colors"
                                            title="Request Item"
                                        >
                                            <ShoppingCart className="w-3 h-3" />
                                        </Link>
                                    )}

                                    <Link
                                        href={`/inventory/${item.ID}/edit`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 rounded"
                                        title="Edit Item"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
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
                        <Edit className="w-3 h-3" />
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
                            href="/requisitions/form"
                            className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1.5 px-2 rounded-md flex items-center justify-center gap-1 transition-colors"
                        >
                            <ShoppingCart className="w-3 h-3" />
                            Request Item
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
                        <Edit className="w-4 h-4" />
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
                        href="requisitions/form"
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1.5 px-3 rounded-md flex items-center gap-1 transition-colors"
                    >
                        <ShoppingCart className="w-3 h-3" />
                         Request Item
                    </Link>
                ) : (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {/* Removed the redundant "⚠️ Low" text since we already have the status tag */}
                    </div>
                )}
            </div>
        </div>
    );
}
