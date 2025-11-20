import { useState, useEffect, useRef } from 'react';
import { formatCurrency, formatDate } from './utils/formatters';
import { getStatusColor, getStatusDisplayName } from './utils/purchaseCalculations';

interface PurchaseDetailModalProps {
    purchase: any;
    isOpen: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: (id: number) => void;
    onStatusChange: (id: number, newStatus: string) => void;
}

export default function PurchaseDetailModal({
                                                purchase,
                                                isOpen,
                                                onClose,
                                                onEdit,
                                                onDelete,
                                                onStatusChange
                                            }: PurchaseDetailModalProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleDelete = () => {
        if (purchase) {
            onDelete(purchase.ID);
        }
        setShowDeleteConfirm(false);
    };

    const handleStatusChange = (newStatus: string) => {
        if (purchase) {
            onStatusChange(purchase.ID, newStatus);
        }
        setShowStatusDropdown(false);
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

    if (!isOpen || !purchase) return null;

// Update the statusOptions array in PurchaseDetailModal.tsx
    const statusOptions = [
        { value: 'pending_approval', label: 'Pending Approval', description: 'Automatically created when requisition is approved' },
        { value: 'merged', label: 'Merged', description: 'When merged with other purchase orders' },
        { value: 'issued', label: 'Issued', description: 'When manager sends PO to supplier' },
        { value: 'rejected', label: 'Rejected', description: 'When PO is rejected by supplier' },
        { value: 'delivered', label: 'Delivered', description: 'When delivery is created' },
        { value: 'partially_delivered', label: 'Partially Delivered', description: 'When delivery is created, but return is also created' },
        { value: 'received', label: 'Received', description: 'When encoder marks it received via requisition' }
    ];

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-sidebar rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-sidebar-border">
                    {/* Header - Sticky */}
                    <div className="flex-shrink-0 p-6 border-b border-sidebar-border bg-white dark:bg-sidebar sticky top-0 z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {purchase?.REFERENCE_NO}
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Purchase Order Details
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
                            {/* Order Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Status
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(purchase?.STATUS)}`}>
                                                <PurchaseStatusIcon status={purchase?.STATUS} />
                                                {getStatusDisplayName(purchase?.STATUS)}
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
                                                            {/* Scrollable container with fixed height */}
                                                            <div className="max-h-48 overflow-y-auto pr-1">
                                                                {statusOptions.map((status) => (
                                                                    <button
                                                                        key={status.value}
                                                                        onClick={() => handleStatusChange(status.value)}
                                                                        className={`w-full text-left px-3 py-3 text-sm flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-sidebar-accent transition-colors rounded-md ${
                                                                            purchase?.STATUS === status.value
                                                                                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                                                                : 'border border-transparent'
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-center gap-3 flex-1">
                                                                            <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                                                                                purchase?.STATUS === status.value
                                                                                    ? 'bg-blue-600 dark:bg-blue-400'
                                                                                    : 'bg-gray-300 dark:bg-gray-600'
                                                                            }`}>
                                                                                {purchase?.STATUS === status.value && (
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

                                                            {statusOptions.length > 4 && (
                                                                <div className="mt-2 pt-2 border-t border-sidebar-border">
                                                                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                                                                        Scroll for more options
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Reference Number
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white font-mono font-medium">
                                            {purchase?.REFERENCE_NO}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Order Date
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {purchase?.CREATED_AT ? formatDate(purchase.CREATED_AT) : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Total Amount
                                        </label>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {formatCurrency(purchase?.TOTAL_COST || 0)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Payment Type
                                        </label>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            {purchase?.PAYMENT_TYPE?.charAt(0).toUpperCase() + purchase?.PAYMENT_TYPE?.slice(1)}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Items Count
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                                            {purchase?.ITEMS?.length || 0} items
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Supplier Information */}
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
                                            {purchase?.SUPPLIER_NAME || 'No supplier assigned'}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {purchase?.SUPPLIER_EMAIL}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {purchase?.SUPPLIER_CONTACT}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Payment Methods
                                        </label>
                                        <div className="flex flex-wrap gap-1">
                                            {purchase?.ALLOWS_CASH && (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                    Cash
                                                </span>
                                            )}
                                            {purchase?.ALLOWS_DISBURSEMENT && (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                    Disbursement
                                                </span>
                                            )}
                                            {purchase?.ALLOWS_STORE_CREDIT && (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                                    Store Credit
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Requisition Information */}
                            <div className="border-t border-sidebar-border pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Requisition Information
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">Requestor:</span>
                                        <p className="font-medium">{purchase?.REQUESTOR}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">Priority:</span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                            purchase?.PRIORITY === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                purchase?.PRIORITY === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                        }`}>
                                            {purchase?.PRIORITY}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">Requisition Date:</span>
                                        <p>{purchase?.REQUISITION_DATE ? formatDate(purchase.REQUISITION_DATE) : 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">Items:</span>
                                        <p>{purchase?.ITEMS?.length || 0}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="border-t border-sidebar-border pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Order Items
                                </h3>
                                <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border">
                                    <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-100 dark:bg-sidebar border-b border-sidebar-border text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        <div className="col-span-6">Item</div>
                                        <div className="col-span-2 text-right">Quantity</div>
                                        <div className="col-span-2 text-right">Unit Price</div>
                                        <div className="col-span-2 text-right">Total</div>
                                    </div>
                                    <div className="divide-y divide-sidebar-border">
                                        {purchase?.ITEMS?.map((item: any) => (
                                            <div key={item.ID} className="grid grid-cols-12 gap-4 px-4 py-3">
                                                <div className="col-span-6">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {item.NAME}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {item.CATEGORY}
                                                    </p>
                                                </div>
                                                <div className="col-span-2 text-right">
                                                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                                                        {item.QUANTITY}
                                                    </p>
                                                </div>
                                                <div className="col-span-2 text-right">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {formatCurrency(item.UNIT_PRICE)}
                                                    </p>
                                                </div>
                                                <div className="col-span-2 text-right">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                        {formatCurrency(item.QUANTITY * item.UNIT_PRICE)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Total Row */}
                                    <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-sidebar border-t border-sidebar-border">
                                        <div className="col-span-8"></div>
                                        <div className="col-span-4 text-right">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Grand Total:</p>
                                            <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                                {formatCurrency(purchase?.TOTAL_COST || 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div className="border-t border-sidebar-border pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Additional Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Created Date
                                        </label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {purchase?.CREATED_AT ? formatDate(purchase.CREATED_AT) : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Last Updated
                                        </label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {purchase?.UPDATED_AT ? formatDate(purchase.UPDATED_AT) : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                {purchase?.REMARKS && (
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Remarks
                                        </label>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-sidebar-accent p-3 rounded-lg">
                                            {purchase.REMARKS}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer with Actions */}
                    <div className="flex-shrink-0 p-6 border-t border-sidebar-border bg-gray-50 dark:bg-sidebar-accent">
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete Order
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={onEdit}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Order
                                </button>
                            </div>
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
                                Delete Purchase Order
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Are you sure you want to delete "{purchase?.REFERENCE_NO}"? This action cannot be undone.
                            </p>
                        </div>
                        <div className="p-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Status Icon Component
// Updated Purchase Status Icon Component
function PurchaseStatusIcon({ status }: { status: string }) {
    switch (status?.toLowerCase()) {
        case 'pending':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        case 'merged':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
            );
        case 'issued':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            );
        case 'rejected':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            );
        case 'delivered':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            );
        case 'partially_delivered':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
            );
        case 'received':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
