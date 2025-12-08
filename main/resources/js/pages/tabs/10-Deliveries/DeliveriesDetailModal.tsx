import { useState, useEffect, useRef } from 'react';
import { DeliveriesIcons } from './utils/icons';
import { getDeliveriesStatusColor } from './utils/styleUtils';
import { formatCurrency, formatDate, formatDateTime } from './utils/formatters';
import deliveryItems from "@/pages/datasets/delivery_items";
import { usePage } from "@inertiajs/react";

// Add proper TypeScript interfaces
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

interface Delivery {
    id: number;
    type: string;
    delivery_date: string;
    total_cost: number;
    receipt_no: string;
    receipt_photo: string | null;
    status: string;
    remarks: string | null;
    po_id: number | null;
    purchase_order: any;
    ref_no?: string;
    items?: DeliveryItem[];
    services?: DeliveryService[];
}

export interface DeliveryItem {
    id: number;
    delivery_id: number | null;
    item_id: number | null;
    item: Item;
    quantity: number;
    unit_price: number;
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

interface DeliveriesDetailModalProps {
    delivery: Delivery; // <-- REQUIRED!
    deliveryItems: DeliveryItem[];
    deliveryServices: DeliveryService[];
    isOpen: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: (id: number) => void;
    onStatusChange: (deliveryId: number, newStatus: string) => void;
}

export default function DeliveriesDetailModal({
                                                  delivery,
                                                  deliveryItems,
                                                  deliveryServices,
                                                  isOpen,
                                                  onClose,
                                                  onEdit,
                                                  onDelete,
                                                  onStatusChange
                                              }: DeliveriesDetailModalProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Combine delivery with its items and services
    const combinedDelivery = {
        ...delivery,
        items: delivery.items || deliveryItems || [],
        services: delivery.services || deliveryServices || []
    };
    
    // Determine delivery type
    const isServiceDelivery = combinedDelivery.type === 'Service Delivery' || 
                             (combinedDelivery.type === undefined && combinedDelivery.services && combinedDelivery.services.length > 0);
    const isItemDelivery = combinedDelivery.type === 'Item Purchase' || 
                          (combinedDelivery.type === undefined && combinedDelivery.items && combinedDelivery.items.length > 0);
    const isMixedDelivery = combinedDelivery.type === 'Mixed' || 
                           (combinedDelivery.items && combinedDelivery.items.length > 0 && 
                            combinedDelivery.services && combinedDelivery.services.length > 0);
    
    // Calculate totals dynamically
    const calculateItemTotals = () => {
        if (!combinedDelivery.items || combinedDelivery.items.length === 0) return { totalItems: 0, totalItemValue: 0 };
        
        const totalItems = combinedDelivery.items.reduce((sum, item) => sum + item.quantity, 0);
        const totalItemValue = combinedDelivery.items.reduce((sum, item) => 
            sum + (item.quantity * parseFloat(item.unit_price?.toString() || '0')), 0);
        
        return { totalItems, totalItemValue };
    };
    
    const calculateServiceTotals = () => {
        if (!combinedDelivery.services || combinedDelivery.services.length === 0) return { totalServices: 0, totalServiceValue: 0 };
        
        const totalServices = combinedDelivery.services.length;
        const totalServiceValue = combinedDelivery.services.reduce((sum, service) => {
            const hours = service.hours || 0;
            const rate = service.hourly_rate || service.service?.hourly_rate || 0;
            return sum + (hours * parseFloat(rate.toString()));
        }, 0);
        
        return { totalServices, totalServiceValue };
    };
    
    const itemTotals = calculateItemTotals();
    const serviceTotals = calculateServiceTotals();
    const totalItems = itemTotals.totalItems;
    const totalServices = serviceTotals.totalServices;
    const totalItemValue = itemTotals.totalItemValue;
    const totalServiceValue = serviceTotals.totalServiceValue;
    
    // Get delivery type display
    const getDeliveryTypeDisplay = () => {
        if (combinedDelivery.type) return combinedDelivery.type;
        if (isMixedDelivery) return 'Mixed';
        if (isServiceDelivery) return 'Service Delivery';
        if (isItemDelivery) return 'Item Purchase';
        return 'Unknown';
    };
    
    const handleDelete = () => {
        onDelete(delivery.id);
        setShowDeleteConfirm(false);
    };
    
    const handleStatusChange = (newStatus: string) => {
        onStatusChange(delivery.id, newStatus);
        setShowStatusDropdown(false);
        onClose(); // Auto-close the modal after status change
    };
    
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowStatusDropdown(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    if (!isOpen || !delivery) return null;
    
    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-sidebar rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-sidebar-border">
                    {/* Header - Sticky */}
                    <div className="flex-shrink-0 p-6 border-b border-sidebar-border bg-white dark:bg-sidebar sticky top-0 z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Delivery #{delivery.receipt_no}
                                    </h2>
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getDeliveryTypeColor(getDeliveryTypeDisplay())}`}>
                                        {getDeliveryIcon(getDeliveryTypeDisplay())}
                                        {getDeliveryTypeDisplay()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Delivered on {formatDateTime(delivery.delivery_date)}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    {/* Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6 space-y-6 bg-white dark:bg-sidebar">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Status
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getDeliveriesStatusColor(delivery?.status)}`}>
                                                <DeliveryStatusIcon status={delivery?.status} />
                                                {delivery?.status}
                                            </div>
                                            <div className="relative" ref={dropdownRef}>
                                                <button
                                                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    Change Status
                                                </button>
                                                
                                                {showStatusDropdown && (
                                                    <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg shadow-lg z-20">
                                                        <div className="p-3">
                                                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                                                                Update Status
                                                            </div>
                                                            <div className="max-h-48 overflow-y-auto pr-1">
                                                                {statusOptions.map((status) => (
                                                                    <button
                                                                        key={status.value}
                                                                        onClick={() => handleStatusChange(status.value)}
                                                                        className={`w-full text-left px-3 py-3 text-sm flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-sidebar-accent transition-colors rounded-md ${
                                                                            delivery?.status === status.value
                                                                                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                                                                : 'border border-transparent'
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-center gap-3 flex-1">
                                                                            <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                                                                                delivery?.status === status.value
                                                                                    ? 'bg-blue-600 dark:bg-blue-400'
                                                                                    : 'bg-gray-300 dark:bg-gray-600'
                                                                            }`}>
                                                                                {delivery?.status === status.value && (
                                                                                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                                    </svg>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <div className="font-medium text-gray-900 dark:text-white">
                                                                                    {status.label}
                                                                                </div>
                                                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                                                                    {status.description}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Delivery Reference
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                                            {delivery.ref_no || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Receipt Number
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white font-medium font-mono">
                                            {delivery.receipt_no}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Delivery Date
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {formatDate(delivery.delivery_date)}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {/* Dynamic Content Display */}
                                    {isItemDelivery && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Total Items
                                            </label>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                {totalItems} items
                                            </p>
                                        </div>
                                    )}
                                    
                                    {isServiceDelivery && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Total Services
                                            </label>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                {totalServices} services
                                            </p>
                                        </div>
                                    )}
                                    
                                    {isMixedDelivery && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Total Items
                                                </label>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {totalItems} items
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Total Services
                                                </label>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {totalServices} services
                                                </p>
                                            </div>
                                        </>
                                    )}
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Total Value
                                        </label>
                                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                            {formatCurrency(totalItemValue + totalServiceValue || delivery.total_cost)}
                                        </p>
                                        {(isMixedDelivery && (totalItemValue > 0 && totalServiceValue > 0)) && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Items: {formatCurrency(totalItemValue)} + Services: {formatCurrency(totalServiceValue)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Receipt Photo */}
                            {delivery.receipt_photo && (
                                <div className="border-t border-sidebar-border pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Receipt Photo
                                    </h3>
                                    <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border p-4">
                                        <img
                                            src={delivery.receipt_photo}
                                            alt="Delivery receipt"
                                            className="max-w-full h-auto rounded-lg max-h-64 object-contain"
                                        />
                                    </div>
                                </div>
                            )}
                            
                            {/* Supplier Information */}
                            {delivery.purchase_order && (
                                <div className="border-t border-sidebar-border pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Supplier Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Supplier Name
                                            </label>
                                            <p className="text-sm text-gray-900 dark:text-white font-medium">
                                                {delivery.purchase_order?.vendor?.name || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Purchase Order Reference
                                            </label>
                                            <p className="text-sm text-gray-900 dark:text-white">
                                                {delivery.purchase_order?.ref_no || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* ITEMS SECTION - Only show if delivery has items */}
                            {combinedDelivery.items && combinedDelivery.items.length > 0 && (
                                <div className="border-t border-sidebar-border pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Delivered Items
                                    </h3>
                                    <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border overflow-hidden">
                                        <table className="w-full">
                                            <thead>
                                            <tr className="border-b border-sidebar-border bg-gray-100 dark:bg-sidebar">
                                                <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Item Name</th>
                                                <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</th>
                                                <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Unit Price</th>
                                                <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Total</th>
                                                <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Barcode</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {combinedDelivery.items.map((item: DeliveryItem) => (
                                                <tr key={item.id} className="border-b border-sidebar-border last:border-b-0">
                                                    <td className="p-3 text-sm text-gray-900 dark:text-white">{item.item?.name || 'Unknown Item'}</td>
                                                    <td className="p-3 text-sm text-gray-900 dark:text-white">{item.quantity}</td>
                                                    <td className="p-3 text-sm text-gray-900 dark:text-white">{formatCurrency(item.unit_price)}</td>
                                                    <td className="p-3 text-sm text-gray-900 dark:text-white font-medium">
                                                        {formatCurrency(item.quantity * parseFloat(item.unit_price?.toString() || '0'))}
                                                    </td>
                                                    <td className="p-3 text-sm text-gray-900 dark:text-white font-mono">{item.item?.barcode || 'N/A'}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                            
                            {/* SERVICES SECTION - Only show if delivery has services */}
                            {combinedDelivery.services && combinedDelivery.services.length > 0 && (
                                <div className="border-t border-sidebar-border pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Delivered Services
                                    </h3>
                                    <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border overflow-hidden">
                                        <table className="w-full">
                                            <thead>
                                            <tr className="border-b border-sidebar-border bg-gray-100 dark:bg-sidebar">
                                                <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Service Name</th>
                                                <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Description</th>
                                                <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Hours</th>
                                                <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Hourly Rate</th>
                                                <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Total</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {combinedDelivery.services.map((service: DeliveryService) => {
                                                const hours = service.hours || 0;
                                                const rate = service.hourly_rate || service.service?.hourly_rate || 0;
                                                const total = hours * parseFloat(rate.toString());
                                                
                                                return (
                                                    <tr key={service.id} className="border-b border-sidebar-border last:border-b-0">
                                                        <td className="p-3 text-sm text-gray-900 dark:text-white">{service.service?.name || 'Unknown Service'}</td>
                                                        <td className="p-3 text-sm text-gray-900 dark:text-white">{service.service?.description || 'N/A'}</td>
                                                        <td className="p-3 text-sm text-gray-900 dark:text-white">{hours}</td>
                                                        <td className="p-3 text-sm text-gray-900 dark:text-white">{formatCurrency(rate)}</td>
                                                        <td className="p-3 text-sm text-gray-900 dark:text-white font-medium">
                                                            {formatCurrency(total)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                            
                            {/* Remarks */}
                            {delivery.remarks && (
                                <div className="border-t border-sidebar-border pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Remarks
                                    </h3>
                                    <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border p-4">
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {delivery.remarks}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Footer with Actions */}
                    <div className="flex-shrink-0 p-6 border-t border-sidebar-border bg-gray-50 dark:bg-sidebar-accent">
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete Delivery
                            </button>
                            <button
                                onClick={onEdit}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Delivery
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-sidebar rounded-xl max-w-md w-full border border-sidebar-border">
                        <div className="p-6 border-b border-sidebar-border">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Delete Delivery
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Are you sure you want to delete delivery "{delivery.receipt_no}"? This action cannot be undone.
                            </p>
                        </div>
                        <div className="p-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                            >
                                Delete Delivery
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Helper functions for delivery type
function getDeliveryTypeColor(type: string): string {
    switch (type?.toLowerCase()) {
        case 'item purchase':
            return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
        case 'service delivery':
            return 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border border-purple-200 dark:border-purple-800';
        case 'mixed':
            return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800';
        default:
            return 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
    }
}

function getDeliveryIcon(type: string) {
    switch (type?.toLowerCase()) {
        case 'item purchase':
            return (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            );
        case 'service delivery':
            return (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            );
        case 'mixed':
            return (
                <div className="flex">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <svg className="w-3 h-3 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
            );
        default:
            return (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            );
    }
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

// Status options (add this constant)
const statusOptions = [
    { value: 'Pending', label: 'Pending', description: 'Delivery is awaiting processing' },
    { value: 'In Transit', label: 'In Transit', description: 'Delivery is on the way' },
    { value: 'Received', label: 'Received', description: 'Delivery has been received' },
    { value: 'With Returns', label: 'With Returns', description: 'Delivery has some returned items' },
    { value: 'Cancelled', label: 'Cancelled', description: 'Delivery has been cancelled' }
];