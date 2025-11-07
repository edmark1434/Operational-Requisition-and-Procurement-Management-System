import { Link } from '@inertiajs/react';
import { formatCurrency } from './utils/formatters';
import { getStatusColor, getStatusDisplayName } from './utils/purchaseCalculations';
import { LoaderCircle, Package, Edit, Truck } from 'lucide-react';

interface PurchaseListProps {
    purchases: any[];
    onPurchaseClick: (purchase: any) => void;
    viewMode: 'comfortable' | 'compact' | 'condensed';
    isLoading?: boolean;
}

export default function PurchaseList({ purchases, onPurchaseClick, viewMode, isLoading = false }: PurchaseListProps) {
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-8">
                <div className="flex items-center justify-center">
                    <LoaderCircle className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">Loading purchases...</span>
                </div>
            </div>
        );
    }

    if (purchases.length === 0) {
        return (
            <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border bg-sidebar dark:bg-sidebar">
                <div className="h-full overflow-y-auto">
                    <div className="p-4 text-center py-12">
                        <div className="text-gray-400 dark:text-gray-600 mb-4">
                            <Package className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No purchase orders found</h3>
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
                    <div className="col-span-2">Reference</div>
                    <div className="col-span-2">Supplier</div>
                    <div className="col-span-1">Items</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Total</div>
                    <div className="col-span-2 text-right">Date</div>
                    <div className="col-span-1 text-right">Actions</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-sidebar-border">
                    {purchases.map((purchase) => (
                        <div
                            key={purchase.ID}
                            className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-sidebar transition-colors cursor-pointer"
                            onClick={() => onPurchaseClick(purchase)}
                        >
                            {/* Reference */}
                            <div className="col-span-2 flex items-center">
                                <div className="min-w-0">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {purchase.REFERENCE_NO}
                                    </div>
                                </div>
                            </div>

                            {/* Supplier */}
                            <div className="col-span-2 flex items-center">
                                <span className="text-sm text-gray-900 dark:text-white">
                                    {purchase.SUPPLIER_NAME}
                                </span>
                            </div>

                            {/* Items Count */}
                            <div className="col-span-1 flex items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {purchase.ITEMS.length} items
                                </span>
                            </div>

                            {/* Status */}
                            <div className="col-span-2 flex items-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(purchase.STATUS)}`}>
                                    {getStatusDisplayName(purchase.STATUS)}
                                </span>
                            </div>

                            {/* Total */}
                            <div className="col-span-2 flex items-center justify-end">
                                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                    {formatCurrency(purchase.TOTAL_COST)}
                                </span>
                            </div>

                            {/* Date */}
                            <div className="col-span-2 flex items-center justify-end">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {new Date(purchase.CREATED_AT).toLocaleDateString()}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="col-span-1 flex items-center justify-end space-x-2">
                                <Link
                                    href={`/purchases/${purchase.ID}/edit`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 rounded"
                                    title="Edit Purchase"
                                >
                                    <Edit className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border bg-sidebar dark:bg-sidebar">
            <div className="h-full overflow-y-auto p-4">
                <div className={`grid gap-4 ${
                    viewMode === 'comfortable'
                        ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
                        : 'grid-cols-1 lg:grid-cols-3 xl:grid-cols-4'
                }`}>
                    {purchases.map((purchase) => (
                        <PurchaseCard
                            key={purchase.ID}
                            purchase={purchase}
                            onClick={() => onPurchaseClick(purchase)}
                            viewMode={viewMode}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Purchase Card Component
function PurchaseCard({ purchase, onClick, viewMode }: {
    purchase: any;
    onClick: () => void;
    viewMode: 'comfortable' | 'compact';
}) {
    if (viewMode === 'compact') {
        return (
            <div className="border border-sidebar-border rounded-lg bg-white dark:bg-sidebar-accent p-3 hover:shadow-md transition-all duration-200 cursor-pointer group">
                {/* Compact Header */}
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {purchase.REFERENCE_NO}
                    </span>
                    <Link
                        href={`/purchases/${purchase.ID}/edit`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1"
                    >
                        <Edit className="w-3 h-3" />
                    </Link>
                </div>

                {/* Supplier Name */}
                <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-1 line-clamp-1">
                    {purchase.SUPPLIER_NAME}
                </h3>

                {/* Status */}
                <div className="mb-2">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getStatusColor(purchase.STATUS)}`}>
                        {getStatusDisplayName(purchase.STATUS)}
                    </span>
                </div>

                {/* Details */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Items:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {purchase.ITEMS.length}
                        </span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Total:</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(purchase.TOTAL_COST)}
                        </span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Date:</span>
                        <span className="text-gray-600 dark:text-gray-400">
                            {new Date(purchase.CREATED_AT).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // Comfortable View
    return (
        <div className="border border-sidebar-border rounded-lg bg-white dark:bg-sidebar-accent p-4 hover:shadow-md transition-all duration-200 cursor-pointer group">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div>
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-sidebar px-2 py-1 rounded">
                        {purchase.REFERENCE_NO}
                    </span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Link
                        href={`/purchases/${purchase.ID}/edit`}
                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded"
                    >
                        <Edit className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Supplier */}
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {purchase.SUPPLIER_NAME}
            </h3>

            {/* Status */}
            <div className="mb-3">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.STATUS)}`}>
                    {getStatusDisplayName(purchase.STATUS)}
                </span>
            </div>

            {/* Items List */}
            <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Items:</h4>
                <div className="space-y-1">
                    {purchase.ITEMS.slice(0, 3).map((item: any) => (
                        <div key={item.ID} className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400 truncate">{item.NAME}</span>
                            <span className="text-gray-900 dark:text-white font-medium">
                                {item.QUANTITY} × {formatCurrency(item.UNIT_PRICE)}
                            </span>
                        </div>
                    ))}
                    {purchase.ITEMS.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            +{purchase.ITEMS.length - 3} more items
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-sidebar-border">
                <div className="text-sm">
                    <div className="font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(purchase.TOTAL_COST)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(purchase.CREATED_AT).toLocaleDateString()}
                    </div>
                </div>
                <button
                    onClick={onClick}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                    View Details
                </button>
            </div>
        </div>
    );
}
