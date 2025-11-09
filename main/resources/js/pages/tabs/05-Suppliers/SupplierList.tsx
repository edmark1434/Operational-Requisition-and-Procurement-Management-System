import { Link } from '@inertiajs/react';
import { Edit, Phone, Mail, Package } from 'lucide-react';
import { formatCurrency } from './utils/formatters';

interface SupplierListProps {
    suppliers: any[];
    onSupplierClick: (supplier: any) => void;
    viewMode: 'comfortable' | 'compact' | 'condensed';
    isLoading?: boolean;
}

export default function SupplierList({ suppliers, onSupplierClick, viewMode, isLoading = false }: SupplierListProps) {
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                    <span className="text-gray-600 dark:text-gray-400">Loading suppliers...</span>
                </div>
            </div>
        );
    }

    if (suppliers.length === 0) {
        return (
            <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border bg-sidebar dark:bg-sidebar">
                <div className="h-full overflow-y-auto">
                    <div className="p-4 text-center py-12">
                        <div className="text-gray-400 dark:text-gray-600 mb-4">
                            <Package className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No suppliers found</h3>
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
                    <div className="col-span-3">Supplier</div>
                    <div className="col-span-2">Contact</div>
                    <div className="col-span-2">Categories</div>
                    <div className="col-span-2">Items</div>
                    <div className="col-span-2">Payment Methods</div>
                    <div className="col-span-1 text-right">Actions</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-sidebar-border">
                    {suppliers.map((supplier) => (
                        <div
                            key={supplier.ID}
                            className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-sidebar transition-colors cursor-pointer"
                            onClick={() => onSupplierClick(supplier)}
                        >
                            {/* Supplier Info */}
                            <div className="col-span-3 flex items-center space-x-3">
                                <div className="min-w-0">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {supplier.NAME}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        #{supplier.ID}
                                    </div>
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="col-span-2 flex items-center space-x-2">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                        <Mail className="w-3 h-3" />
                                        <span className="truncate">{supplier.EMAIL}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                        <Phone className="w-3 h-3" />
                                        <span>{supplier.CONTACT_NUMBER}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="col-span-2 flex items-center">
                                <div className="flex flex-wrap gap-1">
                                    {supplier.CATEGORIES.slice(0, 2).map((category: string, index: number) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-sidebar text-gray-600 dark:text-gray-400 border border-sidebar-border"
                                        >
                                            {category}
                                        </span>
                                    ))}
                                    {supplier.CATEGORIES.length > 2 && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            +{supplier.CATEGORIES.length - 2} more
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Items */}
                            <div className="col-span-2 flex items-center">
                                <div className="text-sm text-gray-900 dark:text-white">
                                    <div className="font-medium">{supplier.ITEM_COUNT} items</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatCurrency(supplier.TOTAL_ITEMS_VALUE)}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <div className="col-span-2 flex items-center">
                                <div className="flex flex-wrap gap-1">
                                    {supplier.ALLOWS_CASH && (
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                            Cash
                                        </span>
                                    )}
                                    {supplier.ALLOWS_DISBURSEMENT && (
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            Disbursement
                                        </span>
                                    )}
                                    {supplier.ALLOWS_STORE_CREDIT && (
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                            Credit
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="col-span-1 flex items-center justify-end">
                                <Link
                                    href={`/suppliers/${supplier.ID}/edit`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 rounded"
                                    title="Edit Supplier"
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
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6'
                }`}>
                    {suppliers.map((supplier) => (
                        <SupplierCard
                            key={supplier.ID}
                            supplier={supplier}
                            onClick={() => onSupplierClick(supplier)}
                            viewMode={viewMode}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Supplier Card Component for Comfortable and Compact views
function SupplierCard({ supplier, onClick, viewMode }: {
    supplier: any;
    onClick: () => void;
    viewMode: 'comfortable' | 'compact';
}) {
    if (viewMode === 'compact') {
        return (
            <div className="border border-sidebar-border rounded-lg bg-white dark:bg-sidebar-accent p-3 hover:shadow-md transition-all duration-200 cursor-pointer group">
                {/* Compact Header */}
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        #{supplier.ID}
                    </span>
                    <Link
                        href={`/suppliers/${supplier.ID}/edit`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1"
                    >
                        <Edit className="w-3 h-3" />
                    </Link>
                </div>

                {/* Supplier Name - Compact */}
                <h3
                    className="font-medium text-sm text-gray-900 dark:text-white mb-1 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={onClick}
                >
                    {supplier.NAME}
                </h3>

                {/* Contact Info - Compact */}
                <div className="space-y-1 mb-2">
                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{supplier.EMAIL}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                        <Phone className="w-3 h-3" />
                        <span>{supplier.CONTACT_NUMBER}</span>
                    </div>
                </div>

                {/* Categories - Compact */}
                <div className="mb-2">
                    <div className="flex flex-wrap gap-1">
                        {supplier.CATEGORIES.slice(0, 2).map((category: string, index: number) => (
                            <span
                                key={index}
                                className="inline-block px-1.5 py-0.5 rounded text-xs bg-gray-100 dark:bg-sidebar text-gray-600 dark:text-gray-400"
                            >
                                {category}
                            </span>
                        ))}
                        {supplier.CATEGORIES.length > 2 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                +{supplier.CATEGORIES.length - 2}
                            </span>
                        )}
                    </div>
                </div>

                {/* Stats and Payment - Compact */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Items:</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {supplier.ITEM_COUNT}
                        </span>
                    </div>

                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Value:</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(supplier.TOTAL_ITEMS_VALUE)}
                        </span>
                    </div>

                    {/* Payment Methods - Compact */}
                    <div className="flex gap-1 mt-1">
                        {supplier.ALLOWS_CASH && (
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500" title="Cash"></span>
                        )}
                        {supplier.ALLOWS_DISBURSEMENT && (
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500" title="Disbursement"></span>
                        )}
                        {supplier.ALLOWS_STORE_CREDIT && (
                            <span className="inline-block w-2 h-2 rounded-full bg-purple-500" title="Store Credit"></span>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Comfortable View
    return (
        <div className="border border-sidebar-border rounded-lg bg-white dark:bg-sidebar-accent p-4 hover:shadow-md transition-all duration-200 cursor-pointer group">
            {/* Header with ID and Actions */}
            <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-sidebar px-2 py-1 rounded">
                    #{supplier.ID}
                </span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Link
                        href={`/suppliers/${supplier.ID}/edit`}
                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded"
                    >
                        <Edit className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Supplier Name */}
            <h3
                className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400"
                onClick={onClick}
            >
                {supplier.NAME}
            </h3>

            {/* Contact Information */}
            <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${supplier.EMAIL}`} className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline" onClick={(e) => e.stopPropagation()}>
                        {supplier.EMAIL}
                    </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span>{supplier.CONTACT_NUMBER}</span>
                </div>
            </div>

            {/* Categories */}
            <div className="mb-3">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Categories
                </label>
                <div className="flex flex-wrap gap-1">
                    {supplier.CATEGORIES.map((category: string, index: number) => (
                        <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-50 dark:bg-sidebar text-gray-600 dark:text-gray-400 border border-sidebar-border"
                        >
                            {category}
                        </span>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="space-y-2 mb-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Items Provided:</span>
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {supplier.ITEM_COUNT}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Value:</span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(supplier.TOTAL_ITEMS_VALUE)}
                    </span>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="border-t border-sidebar-border pt-3">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Payment Methods
                </label>
                <div className="flex flex-wrap gap-2">
                    {supplier.ALLOWS_CASH && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-200 dark:border-green-800">
                            Cash
                        </span>
                    )}
                    {supplier.ALLOWS_DISBURSEMENT && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                            Disbursement
                        </span>
                    )}
                    {supplier.ALLOWS_STORE_CREDIT && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800">
                            Store Credit
                        </span>
                    )}
                </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-4 pt-3 border-t border-sidebar-border">
                <button
                    onClick={onClick}
                    className="w-full text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-2 text-center hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                    View Details
                </button>
            </div>
        </div>
    );
}
