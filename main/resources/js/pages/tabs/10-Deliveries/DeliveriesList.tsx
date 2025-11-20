import { Link } from '@inertiajs/react';
import { DeliveriesIcons } from './utils/icons';
import { getDeliveriesStatusColor } from './utils/styleUtils';
import { formatCurrency, formatDate } from './utils/formatters';
import { LoaderCircle, Package, Edit } from 'lucide-react';

interface DeliveriesListProps {
    deliveries: any[];
    onDeliveryClick: (delivery: any) => void;
    viewMode: 'comfortable' | 'compact' | 'condensed';
    isLoading?: boolean;
}

// Add this helper function to format status display
function formatStatusDisplay(status: string): string {
    switch (status?.toLowerCase()) {
        case 'received':
            return 'Received';
        case 'with returns':
            return 'With Returns';
        default:
            return status;
    }
}

export default function DeliveriesList({ deliveries, onDeliveryClick, viewMode, isLoading = false }: DeliveriesListProps) {
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-8">
                <div className="flex items-center justify-center">
                    <LoaderCircle className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">Loading deliveries...</span>
                </div>
            </div>
        );
    }

    if (deliveries.length === 0) {
        return (
            <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border bg-sidebar dark:bg-sidebar">
                <div className="h-full overflow-y-auto">
                    <div className="p-4 text-center py-12">
                        <div className="text-gray-400 dark:text-gray-600 mb-4">
                            <Package className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No deliveries found</h3>
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
                    <div className="col-span-2">Receipt No</div>
                    <div className="col-span-2">Supplier</div>
                    <div className="col-span-2">Delivery Date</div>
                    <div className="col-span-1">Items</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Total Value</div>
                    <div className="col-span-1 text-right">Actions</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-sidebar-border">
                    {deliveries.map((delivery) => (
                        <div
                            key={delivery.ID}
                            className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-sidebar transition-colors cursor-pointer"
                            onClick={() => onDeliveryClick(delivery)}
                        >
                            {/* Receipt No */}
                            <div className="col-span-2 flex items-center">
                                <div className="min-w-0">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {delivery.RECEIPT_NO}
                                    </div>
                                </div>
                            </div>

                            {/* Supplier */}
                            <div className="col-span-2 flex items-center">
                                <span className="text-sm text-gray-900 dark:text-white truncate">
                                    {delivery.SUPPLIER_NAME}
                                </span>
                            </div>

                            {/* Delivery Date */}
                            <div className="col-span-2 flex items-center">
                                <span className="text-sm text-gray-900 dark:text-white">
                                    {formatDate(delivery.DELIVERY_DATE)}
                                </span>
                            </div>

                            {/* Items Count */}
                            <div className="col-span-1 flex items-center">
                                <span className="text-sm text-gray-900 dark:text-white">
                                    {delivery.TOTAL_ITEMS}
                                </span>
                            </div>

                            {/* Status - READ ONLY */}
                            <div className="col-span-2 flex items-center">
                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getDeliveriesStatusColor(delivery?.STATUS)}`}>
                                    <DeliveryStatusIcon status={delivery?.STATUS} />
                                    {formatStatusDisplay(delivery?.STATUS)}
                                </span>
                            </div>

                            {/* Total Value */}
                            <div className="col-span-2 flex items-center justify-end">
                                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                    {formatCurrency(delivery.TOTAL_VALUE)}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="col-span-1 flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                                <Link
                                    href={`/deliveries/${delivery.ID}/edit`}
                                    className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 rounded"
                                    title="Edit Delivery"
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
                    {deliveries.map((delivery) => (
                        <DeliveryCard
                            key={delivery.ID}
                            delivery={delivery}
                            onClick={() => onDeliveryClick(delivery)}
                            viewMode={viewMode}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Delivery Card Component - READ ONLY status
function DeliveryCard({ delivery, onClick, viewMode }: {
    delivery: any;
    onClick: () => void;
    viewMode: 'comfortable' | 'compact';
}) {
    if (viewMode === 'compact') {
        return (
            <div
                className="border border-sidebar-border rounded-lg bg-white dark:bg-sidebar-accent p-3 hover:shadow-md transition-all duration-200 cursor-pointer group"
                onClick={onClick}
            >
                {/* Compact Header */}
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {delivery.RECEIPT_NO}
                    </span>
                    <Link
                        href={`/deliveries/${delivery.ID}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1"
                    >
                        <Edit className="w-3 h-3" />
                    </Link>
                </div>

                {/* Supplier - Compact */}
                <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-1 line-clamp-1">
                    {delivery.SUPPLIER_NAME}
                </h3>

                {/* Status - READ ONLY */}
                <div className="mb-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getDeliveriesStatusColor(delivery?.STATUS)}`}>
                        <DeliveryStatusIcon status={delivery?.STATUS} />
                        {formatStatusDisplay(delivery?.STATUS)}
                    </span>
                </div>

                {/* Details */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Items:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {delivery.TOTAL_ITEMS}
                        </span>
                    </div>

                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Value:</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {formatCurrency(delivery.TOTAL_VALUE)}
                        </span>
                    </div>

                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Date:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {formatDate(delivery.DELIVERY_DATE)}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // Comfortable View - READ ONLY status
    return (
        <div
            className="border border-sidebar-border rounded-lg bg-white dark:bg-sidebar-accent p-4 hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={onClick}
        >
            {/* Header with Receipt No and Actions */}
            <div className="flex justify-between items-start mb-3">
                <div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-sidebar px-2 py-1 rounded">
                        {delivery.RECEIPT_NO}
                    </span>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Delivered: {formatDate(delivery.DELIVERY_DATE)}
                    </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
                    <Link
                        href={`/deliveries/${delivery.ID}/edit`}
                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded"
                    >
                        <Edit className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Supplier Name */}
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {delivery.SUPPLIER_NAME}
            </h3>

            {/* Status Badge - READ ONLY */}
            <div className="mb-3">
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getDeliveriesStatusColor(delivery?.STATUS)}`}>
                    <DeliveryStatusIcon status={delivery?.STATUS} />
                    {formatStatusDisplay(delivery?.STATUS)}
                </span>
            </div>

            {/* Delivery Details */}
            <div className="space-y-2">
                {/* Items Count */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Items Delivered:</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {delivery.TOTAL_ITEMS} items
                    </span>
                </div>

                {/* Total Value */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Value:</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(delivery.TOTAL_VALUE)}
                    </span>
                </div>

                {/* Total Cost */}
                <div className="flex justify-between items-center pt-2 border-t border-sidebar-border">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Cost:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(delivery.TOTAL_COST)}
                    </span>
                </div>
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

// Delivery Status Icon Component
function DeliveryStatusIcon({ status }: { status: string }) {
    switch (status?.toLowerCase()) {
        case 'received':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            );
        case 'with returns':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
            );
        default:
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
    }
}
