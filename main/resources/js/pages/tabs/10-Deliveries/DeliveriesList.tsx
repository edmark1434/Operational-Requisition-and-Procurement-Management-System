import { Link } from '@inertiajs/react';
import { DeliveriesIcons } from './utils/icons';
import { getDeliveriesStatusColor } from './utils/styleUtils';
import { formatCurrency, formatDate } from './utils/formatters';
import { LoaderCircle, Package, Edit, Wrench, ShoppingBag, RotateCcw, RefreshCw } from 'lucide-react';

// Add proper TypeScript interfaces
interface DeliveryItem {
    id: number;
    delivery_id: number | null;
    item_id: number | null;
    item: Item;
    quantity: number;
    unit_price: number;
}

export interface Item {
    id: number;
    barcode: string | null;
    name: string;
    dimensions: string | null;
    unit_price: number;
    current_stock: number;
    is_active: boolean;
    make_id: number | null;
    category_id: number;
    vendor_id: number | null;
}

export interface Service {
    id: number;
    name: string;
    description: string;
    hourly_rate: number;
    is_active: boolean;
    category_id: number;
    vendor_id: number | null;
}

export interface DeliveryService {
    id: number;
    delivery_id: number;
    service_id: number;
    service: Service;
    item_id: number | null;
    hours?: number;
    hourly_rate?: number;
}

interface Delivery {
    id: number;
    type: string;
    receipt_no: string;
    delivery_date: string;
    total_cost: number;
    status: string;
    remarks: string;
    receipt_photo: string;
    po_id: number;
    purchase_order: any;
    po_reference: string;
    supplier_id?: number;
    supplier_name: string;
    total_items: number;
    total_value: number;
    delivery_type?: string;
    items: DeliveryItem[];
    services: DeliveryService[];
}

interface DeliveriesListProps {
    deliveries: Delivery[];
    deliveryItems: DeliveryItem[];
    deliveryServices: DeliveryService[];
    onDeliveryClick: (delivery: Delivery) => void;
    onStatusChange: (deliveryId: number, newStatus: string) => void;
    viewMode: 'comfortable' | 'compact' | 'condensed';
    isLoading?: boolean;
}

// Helper function to determine delivery type based on items/services
function determineDeliveryType(items: DeliveryItem[], services: DeliveryService[]): string {
    const hasItems = items && items.length > 0;
    const hasServices = services && services.length > 0;

    if (hasItems && hasServices) {
        return 'Mixed';
    } else if (hasServices) {
        return 'Service Delivery';
    } else if (hasItems) {
        const firstItem = items[0];
        // Check if this is a return based on quantity or other indicators
        if (firstItem.quantity < 0) {
            return 'Item Return';
        }
        return 'Item Purchase';
    }
    return 'Unknown';
}

// Helper function to calculate dynamic totals
function calculateDynamicTotals(delivery: Delivery) {
    let totalItems = 0;
    let totalServices = 0;
    let totalValue = 0;

    // Calculate from items
    if (delivery.items && delivery.items.length > 0) {
        totalItems = delivery.items.reduce((sum, item) => sum + item.quantity, 0);
        totalValue += delivery.items.reduce((sum, item) =>
            sum + (item.quantity * parseFloat(item.unit_price.toString())), 0);
    }

    // Calculate from services
    if (delivery.services && delivery.services.length > 0) {
        totalServices = delivery.services.length;
        totalValue += delivery.services.reduce((sum, service) => {
            const hours = service.hours || 0;
            const rate = service.hourly_rate || service.service?.hourly_rate || 0;
            return sum + (hours * parseFloat(rate.toString()));
        }, 0);
    }

    return {
        totalItems,
        totalServices,
        totalValue,
        totalCount: totalItems + totalServices,
        displayText: getDisplayText(delivery.items, delivery.services)
    };
}

// Helper function to get display text for items/services
function getDisplayText(items: DeliveryItem[], services: DeliveryService[]): string {
    const itemCount = items?.length || 0;
    const serviceCount = services?.length || 0;

    if (itemCount > 0 && serviceCount > 0) {
        return `${itemCount} item${itemCount > 1 ? 's' : ''}, ${serviceCount} service${serviceCount > 1 ? 's' : ''}`;
    } else if (itemCount > 0) {
        return `${itemCount} item${itemCount > 1 ? 's' : ''}`;
    } else if (serviceCount > 0) {
        return `${serviceCount} service${serviceCount > 1 ? 's' : ''}`;
    }
    return 'Empty';
}

// Helper function to get delivery icon
function getDeliveryIcon(type: string, items: DeliveryItem[], services: DeliveryService[]) {
    const deliveryType = type || determineDeliveryType(items, services);

    switch (deliveryType.toLowerCase()) {
        case 'item purchase':
            return <ShoppingBag className="w-3 h-3" />;
        case 'service delivery':
            return <Wrench className="w-3 h-3" />;
        case 'item return':
            return <RotateCcw className="w-3 h-3" />;
        case 'service rework':
            return <RefreshCw className="w-3 h-3" />;
        case 'mixed':
            return (
                <div className="flex">
                    <ShoppingBag className="w-3 h-3" />
                    <Wrench className="w-3 h-3 -ml-1" />
                </div>
            );
        default:
            return <Package className="w-3 h-3" />;
    }
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

// Add this helper function to format delivery type display and get color
function formatDeliveryTypeDisplay(type: string, items: DeliveryItem[], services: DeliveryService[]): string {
    if (type) return type;

    const determinedType = determineDeliveryType(items, services);
    return determinedType || 'Item Purchase';
}

function getDeliveryTypeColor(type: string, items: DeliveryItem[], services: DeliveryService[]): string {
    const deliveryType = type || determineDeliveryType(items, services);

    switch (deliveryType.toLowerCase()) {
        case 'item purchase':
            return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
        case 'service delivery':
            return 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border border-purple-200 dark:border-purple-800';
        case 'item return':
            return 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 border border-orange-200 dark:border-orange-800';
        case 'service rework':
            return 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300 border border-teal-200 dark:border-teal-800';
        case 'mixed':
            return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800';
        default:
            return 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
    }
}

export default function DeliveriesList({
                                           deliveries,
                                           deliveryItems,
                                           deliveryServices,
                                           onDeliveryClick,
                                           onStatusChange,
                                           viewMode,
                                           isLoading = false
                                       }: DeliveriesListProps) {

    // Combine items and services into deliveries
    const enhancedDeliveries = deliveries.map(delivery => ({
        ...delivery,
        items: deliveryItems.filter(item => item.delivery_id === delivery.id),
        services: deliveryServices.filter(service => service.delivery_id === delivery.id)
    }));

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

    if (enhancedDeliveries.length === 0) {
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
                <div className="grid grid-cols-13 gap-4 px-6 py-3 bg-gray-50 dark:bg-sidebar border-b border-sidebar-border text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="col-span-2">Receipt No</div>
                    <div className="col-span-2">Supplier</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-2">Delivery Date</div>
                    <div className="col-span-1">Contents</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1 text-right">Value</div>
                    <div className="col-span-1 text-right">Actions</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-sidebar-border">
                    {enhancedDeliveries.map((delivery) => {
                        const totals = calculateDynamicTotals(delivery);
                        return (
                            <div
                                key={delivery.id}
                                className="grid grid-cols-13 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-sidebar transition-colors cursor-pointer"
                                onClick={() => onDeliveryClick(delivery)}
                            >
                                {/* Receipt No */}
                                <div className="col-span-2 flex items-center">
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {delivery.receipt_no}
                                        </div>
                                    </div>
                                </div>

                                {/* Supplier */}
                                <div className="col-span-2 flex items-center">
                                    <span className="text-sm text-gray-900 dark:text-white truncate">
                                        {delivery.supplier_name}
                                    </span>
                                </div>

                                {/* Delivery Type */}
                                <div className="col-span-2 flex items-center">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getDeliveryTypeColor(delivery.type, delivery.items, delivery.services)}`}>
                                        {getDeliveryIcon(delivery.type, delivery.items, delivery.services)}
                                        {formatDeliveryTypeDisplay(delivery.type, delivery.items, delivery.services)}
                                    </span>
                                </div>

                                {/* Delivery Date */}
                                <div className="col-span-2 flex items-center">
                                    <span className="text-sm text-gray-900 dark:text-white">
                                        {formatDate(delivery.delivery_date)}
                                    </span>
                                </div>

                                {/* Items/Services Count */}
                                <div className="col-span-1 flex items-center">
                                    <span className="text-sm text-gray-900 dark:text-white" title={totals.displayText}>
                                        {totals.totalCount}
                                    </span>
                                </div>

                                {/* Status - READ ONLY */}
                                <div className="col-span-2 flex items-center">
                                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getDeliveriesStatusColor(delivery?.status)}`}>
                                        <DeliveryStatusIcon status={delivery?.status} />
                                        {formatStatusDisplay(delivery?.status)}
                                    </span>
                                </div>

                                {/* Total Value */}
                                <div className="col-span-1 flex items-center justify-end">
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                        {formatCurrency(totals.totalValue || delivery.total_value)}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="col-span-1 flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                                    <Link
                                        href={`/deliveries/${delivery.id}/edit`}
                                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 rounded"
                                        title="Edit Delivery"
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
                        ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
                        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5'
                }`}>
                    {enhancedDeliveries.map((delivery) => (
                        <DeliveryCard
                            key={delivery.id}
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
interface DeliveryCardProps {
    delivery: Delivery;
    onClick: () => void;
    viewMode: 'comfortable' | 'compact';
}

function DeliveryCard({ delivery, onClick, viewMode }: DeliveryCardProps) {
    const totals = calculateDynamicTotals(delivery);

    if (viewMode === 'compact') {
        return (
            <div
                className="border border-sidebar-border rounded-lg bg-white dark:bg-sidebar-accent p-3 hover:shadow-md transition-all duration-200 cursor-pointer group"
                onClick={onClick}
            >
                {/* Compact Header */}
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                            {delivery.receipt_no}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${getDeliveryTypeColor(delivery.type, delivery.items, delivery.services)}`}>
                            {getDeliveryIcon(delivery.type, delivery.items, delivery.services)}
                            {formatDeliveryTypeDisplay(delivery.type, delivery.items, delivery.services).split(' ')[0]}
                        </span>
                    </div>
                    <Link
                        href={`/deliveries/${delivery.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1"
                    >
                        <Edit className="w-3 h-3" />
                    </Link>
                </div>

                {/* Supplier - Compact */}
                <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-1 line-clamp-1">
                    {delivery.supplier_name}
                </h3>

                {/* Status - READ ONLY */}
                <div className="mb-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getDeliveriesStatusColor(delivery?.status)}`}>
                        <DeliveryStatusIcon status={delivery?.status} />
                        {formatStatusDisplay(delivery?.status)}
                    </span>
                </div>

                {/* Details */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Contents:</span>
                        <span className="font-semibold text-gray-900 dark:text-white" title={totals.displayText}>
                            {totals.totalCount}
                        </span>
                    </div>

                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Value:</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {formatCurrency(totals.totalValue || delivery.total_value)}
                        </span>
                    </div>

                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Date:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {formatDate(delivery.delivery_date)}
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
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-sidebar px-2 py-1 rounded">
                            {delivery.ref_no}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getDeliveryTypeColor(delivery.type, delivery.items, delivery.services)}`}>
                            {getDeliveryIcon(delivery.type, delivery.items, delivery.services)}
                            {formatDeliveryTypeDisplay(delivery.type, delivery.items, delivery.services)}
                        </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Delivered: {formatDate(delivery.delivery_date)}
                    </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
                    <Link
                        href={`/deliveries/${delivery.id}/edit`}
                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded"
                    >
                        <Edit className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Supplier Name */}
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {delivery.supplier_name}
            </h3>

            {/* Status Badge - READ ONLY */}
            <div className="mb-3">
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getDeliveriesStatusColor(delivery?.status)}`}>
                    <DeliveryStatusIcon status={delivery?.status} />
                    {formatStatusDisplay(delivery?.status)}
                </span>
            </div>

            {/* Delivery Details */}
            <div className="space-y-2">
                {/* Contents Count */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Contents:</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white" title={totals.displayText}>
                        {totals.displayText}
                    </span>
                </div>

                {/* Total Cost */}
                <div className="flex justify-between items-center pt-2 border-t border-sidebar-border">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Value:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(totals.totalValue || delivery.total_value)}
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
interface DeliveryStatusIconProps {
    status: string;
}

function DeliveryStatusIcon({ status }: DeliveryStatusIconProps) {
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
