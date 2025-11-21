import { Link } from '@inertiajs/react';
import { ReturnsIcons } from './utils/icons';
import { getReturnsStatusColor } from './utils/styleUtils';
import { formatCurrency, formatDate } from './utils/formatters';
import { LoaderCircle, Package, Edit } from 'lucide-react';

interface ReturnsListProps {
    returns: any[];
    onReturnClick: (returnItem: any) => void;
    viewMode: 'comfortable' | 'compact' | 'condensed';
    isLoading?: boolean;
}

// Helper function to capitalize status display
const capitalizeStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function ReturnsList({ returns, onReturnClick, viewMode, isLoading = false }: ReturnsListProps) {
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-8">
                <div className="flex items-center justify-center">
                    <LoaderCircle className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">Loading returns...</span>
                </div>
            </div>
        );
    }

    if (returns.length === 0) {
        return (
            <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border bg-sidebar dark:bg-sidebar">
                <div className="h-full overflow-y-auto">
                    <div className="p-4 text-center py-12">
                        <div className="text-gray-400 dark:text-gray-600 mb-4">
                            <Package className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No returns found</h3>
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
                    <div className="col-span-2">Delivery Ref</div>
                    <div className="col-span-2">Supplier</div>
                    <div className="col-span-1">Items</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Total Value</div>
                    <div className="col-span-1 text-right">Actions</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-sidebar-border">
                    {returns.map((returnItem) => (
                        <div
                            key={returnItem.ID}
                            className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-sidebar transition-colors cursor-pointer"
                            onClick={() => onReturnClick(returnItem)}
                        >
                            {/* Reference */}
                            <div className="col-span-2 flex items-center">
                                <div className="min-w-0">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {returnItem.REFERENCE_NO}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatDate(returnItem.CREATED_AT)}
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Reference */}
                            <div className="col-span-2 flex items-center">
                                <span className="text-sm text-gray-900 dark:text-white">
                                    {returnItem.DELIVERY_REFERENCE}
                                </span>
                            </div>

                            {/* Supplier */}
                            <div className="col-span-2 flex items-center">
                                <span className="text-sm text-gray-900 dark:text-white truncate">
                                    {returnItem.SUPPLIER_NAME}
                                </span>
                            </div>

                            {/* Items Count */}
                            <div className="col-span-1 flex items-center">
                                <span className="text-sm text-gray-900 dark:text-white">
                                    {returnItem.TOTAL_ITEMS}
                                </span>
                            </div>

                            {/* Status */}
                            <div className="col-span-2 flex items-center">
                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getReturnsStatusColor(returnItem.STATUS)}`}>
                                    {ReturnsIcons[returnItem.STATUS.toLowerCase() as keyof typeof ReturnsIcons]}
                                    {capitalizeStatus(returnItem.STATUS)}
                                </div>
                            </div>

                            {/* Total Value */}
                            <div className="col-span-2 flex items-center justify-end">
                                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                    {formatCurrency(returnItem.TOTAL_VALUE)}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="col-span-1 flex items-center justify-end">
                                <Link
                                    href={`/returns/${returnItem.ID}/edit`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 rounded"
                                    title="Edit Return"
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
                        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5'
                }`}>
                    {returns.map((returnItem) => (
                        <ReturnCard
                            key={returnItem.ID}
                            returnItem={returnItem}
                            onClick={() => onReturnClick(returnItem)}
                            viewMode={viewMode}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Return Card Component
function ReturnCard({ returnItem, onClick, viewMode }: {
    returnItem: any;
    onClick: () => void;
    viewMode: 'comfortable' | 'compact';
}) {
    if (viewMode === 'compact') {
        return (
            <div className="border border-sidebar-border rounded-lg bg-white dark:bg-sidebar-accent p-3 hover:shadow-md transition-all duration-200 cursor-pointer group">
                {/* Compact Header */}
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {returnItem.REFERENCE_NO}
                    </span>
                    <Link
                        href={`/returns/${returnItem.ID}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1"
                    >
                        <Edit className="w-3 h-3" />
                    </Link>
                </div>

                {/* Supplier - Compact */}
                <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-1 line-clamp-1">
                    {returnItem.SUPPLIER_NAME}
                </h3>

                {/* Delivery Reference */}
                <div className="mb-2">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-gray-100 dark:bg-sidebar text-gray-600 dark:text-gray-400">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        {returnItem.DELIVERY_REFERENCE}
                    </span>
                </div>

                {/* Status and Items - Compact */}
                <div className="space-y-1">
                    <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${getReturnsStatusColor(returnItem.STATUS)}`}>
                        {ReturnsIcons[returnItem.STATUS.toLowerCase() as keyof typeof ReturnsIcons]}
                        {capitalizeStatus(returnItem.STATUS)}
                    </div>

                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Items:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {returnItem.TOTAL_ITEMS}
                        </span>
                    </div>

                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Value:</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {formatCurrency(returnItem.TOTAL_VALUE)}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // Comfortable View
    return (
        <div className="border border-sidebar-border rounded-lg bg-white dark:bg-sidebar-accent p-4 hover:shadow-md transition-all duration-200 cursor-pointer group">
            {/* Header with Reference and Actions */}
            <div className="flex justify-between items-start mb-3">
                <div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-sidebar px-2 py-1 rounded">
                        {returnItem.REFERENCE_NO}
                    </span>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Created: {formatDate(returnItem.CREATED_AT)}
                    </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Link
                        href={`/returns/${returnItem.ID}/edit`}
                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded"
                    >
                        <Edit className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Supplier Name */}
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {returnItem.SUPPLIER_NAME}
            </h3>

            {/* Delivery Reference */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Delivery: {returnItem.DELIVERY_REFERENCE}
            </div>

            {/* Status Badge */}
            <div className="mb-3">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getReturnsStatusColor(returnItem.STATUS)}`}>
                    {ReturnsIcons[returnItem.STATUS.toLowerCase() as keyof typeof ReturnsIcons]}
                    {capitalizeStatus(returnItem.STATUS)}
                </div>
            </div>

            {/* Return Details */}
            <div className="space-y-2">
                {/* Items Count */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Items to Return:</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {returnItem.TOTAL_ITEMS} items
                    </span>
                </div>

                {/* Total Value */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Value:</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(returnItem.TOTAL_VALUE)}
                    </span>
                </div>

                {/* Return Date */}
                {returnItem.RETURN_DATE && (
                    <div className="flex justify-between items-center pt-2 border-t border-sidebar-border">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Return Date:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatDate(returnItem.RETURN_DATE)}
                        </span>
                    </div>
                )}
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-4 pt-3 border-t border-sidebar-border">
                <button
                    onClick={onClick}
                    className="w-full text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-center"
                >
                    View Details
                </button>
            </div>
        </div>
    );
}
