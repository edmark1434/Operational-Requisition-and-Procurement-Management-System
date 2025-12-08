import { useState, useEffect, useRef } from 'react';
import { ReturnsIcons } from './utils/icons';
import { getReturnsStatusColor } from './utils/styleUtils';
import { formatCurrency, formatDate, formatDateTime } from './utils/formatters';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface ReturnsDetailModalProps {
    returnItem: any;
    isOpen: boolean;
    onClose: () => void;
    onEdit: (item: any) => void;
    onDelete: (id: number) => void;
    onStatusChange: (id: number, newStatus: string) => void;
}

const capitalizeStatus = (status: string | undefined) => {
    if (!status) return 'Unknown';
    return String(status).charAt(0).toUpperCase() + String(status).slice(1).toLowerCase();
};

const statusOptions = [
    { value: 'Pending', label: 'Pending', description: 'Return is created' },
    { value: 'Issued', label: 'Issued', description: 'Return slip sent to supplier' },
    { value: 'Rejected', label: 'Rejected', description: 'Supplier rejected the return' },
    { value: 'Delivered', label: 'Delivered', description: 'Replacement items received' }
];

export default function ReturnsDetailModal({
                                               returnItem,
                                               isOpen,
                                               onClose,
                                               onEdit,
                                               onDelete,
                                               onStatusChange
                                           }: ReturnsDetailModalProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowStatusDropdown(false);
            }
        };
        if (showStatusDropdown) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showStatusDropdown]);

    if (!isOpen || !returnItem) return null;

    // --- DATA NORMALIZATION ---
    // Handles both uppercase (DB) and lowercase (Frontend) keys to prevent undefined errors
    const ID = returnItem.ID || returnItem.id;
    const STATUS = returnItem.STATUS || returnItem.status || 'Pending';
    const REFERENCE_NO = returnItem.REFERENCE_NO || returnItem.reference_no || 'N/A';
    const CREATED_AT = returnItem.CREATED_AT || returnItem.created_at;
    const DELIVERY_REF = returnItem.DELIVERY_REFERENCE || returnItem.delivery_reference || 'N/A';
    const TOTAL_ITEMS = returnItem.TOTAL_ITEMS || returnItem.total_items || 0;
    const TOTAL_VALUE = returnItem.TOTAL_VALUE || returnItem.total_value || 0;
    const RETURN_DATE = returnItem.RETURN_DATE || returnItem.return_date;
    const SUPPLIER_NAME = returnItem.SUPPLIER_NAME || returnItem.supplier_name || 'Unknown';
    const SUPPLIER_ID = returnItem.SUPPLIER_ID || returnItem.supplier_id;
    const REMARKS = returnItem.REMARKS || returnItem.remarks;
    const ITEMS = returnItem.ITEMS || returnItem.items || [];

    const handleDelete = () => {
        if (!ID) return;

        router.delete(`/returns/${ID}`, {
            onSuccess: () => {
                toast.success('Return deleted successfully');
                onDelete(ID);
                setShowDeleteConfirm(false);
                onClose();
            },
            onError: () => {
                toast.error('Failed to delete return');
                setShowDeleteConfirm(false);
            }
        });
    };

    const handleStatusChange = (newStatus: string) => {
        if (!ID) return;

        console.log(`Updating Status for ID: ${ID} to ${newStatus}`); // Debug log

        router.put(`/returns/${ID}/status`,
            { status: newStatus }, // Payload
            {
                preserveScroll: true, // Prevents page jumping
                onSuccess: () => {
                    toast.success(`Status updated to ${newStatus}`);
                    onStatusChange(ID, newStatus);
                    setShowStatusDropdown(false);
                },
                onError: (errors) => {
                    console.error("Status update failed:", errors);
                    // Shows the specific error message from the backend (e.g., "The status field must be a string")
                    if (errors.status) {
                        toast.error(errors.status);
                    } else {
                        toast.error("Failed to update status");
                    }
                }
            }
        );
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
                <div className="bg-white dark:bg-sidebar rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-sidebar-border shadow-2xl">

                    {/* Header */}
                    <div className="flex-shrink-0 p-6 border-b border-sidebar-border bg-white dark:bg-sidebar rounded-t-xl sticky top-0 z-10 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                Return #{REFERENCE_NO}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Created on {formatDateTime(CREATED_AT)}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-sidebar-accent transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6 space-y-8 bg-white dark:bg-sidebar">

                            {/* Status Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                            Current Status
                                        </label>
                                        <div className="flex items-center gap-3">
                                            {/* Status Badge */}
                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${getReturnsStatusColor(STATUS)}`}>
                                                {/* Uses ReturnsIcons safely */}
                                                {ReturnsIcons[String(STATUS).toLowerCase() as keyof typeof ReturnsIcons] || null}
                                                {capitalizeStatus(STATUS)}
                                            </div>

                                            {/* Change Status Button */}
                                            <div className="relative" ref={dropdownRef}>
                                                <button
                                                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                                >
                                                    Change Status
                                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>

                                                {/* Status Dropdown Menu */}
                                                {showStatusDropdown && (
                                                    <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-sidebar border border-sidebar-border rounded-xl shadow-xl z-20 overflow-hidden ring-1 ring-black ring-opacity-5">
                                                        <div className="p-2 space-y-1">
                                                            {statusOptions.map((opt) => (
                                                                <button
                                                                    key={opt.value}
                                                                    onClick={() => handleStatusChange(opt.value)}
                                                                    className={`w-full text-left px-3 py-2.5 text-sm flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-sidebar-accent transition-colors rounded-lg ${
                                                                        STATUS === opt.value
                                                                            ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-200 dark:ring-blue-800'
                                                                            : ''
                                                                    }`}
                                                                >
                                                                    <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                                                                        STATUS === opt.value
                                                                            ? 'border-blue-600 dark:border-blue-400 bg-blue-600 dark:bg-blue-400'
                                                                            : 'border-gray-300 dark:border-gray-600'
                                                                    }`}>
                                                                        {STATUS === opt.value && (
                                                                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                            </svg>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                                            {opt.label}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                                            {opt.description}
                                                                        </div>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* References */}
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                Reference No
                                            </label>
                                            <p className="text-sm font-mono font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-sidebar-accent px-2 py-1 rounded w-fit">
                                                {REFERENCE_NO}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                Original Delivery
                                            </label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {DELIVERY_REF}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Summary */}
                                <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg p-5 border border-sidebar-border">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        Return Summary
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Items</span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{TOTAL_ITEMS}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-sidebar-border/50">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Refund Value</span>
                                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                {formatCurrency(TOTAL_VALUE)}
                                            </span>
                                        </div>
                                        {RETURN_DATE && (
                                            <div className="flex justify-between items-center pt-2 border-t border-sidebar-border/50">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Return Date</span>
                                                <span className="text-sm text-gray-900 dark:text-white">{formatDate(RETURN_DATE)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Supplier & Items Section */}
                            <div className="border-t border-sidebar-border pt-6">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
                                    Return Details
                                </h3>
                                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400">Supplier Name</label>
                                        <p className="font-medium text-gray-900 dark:text-white">{SUPPLIER_NAME}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400">Supplier ID</label>
                                        <p className="font-medium text-gray-900 dark:text-white">#{SUPPLIER_ID || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div className="border rounded-lg border-sidebar-border overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 dark:bg-sidebar-accent border-b border-sidebar-border">
                                        <tr>
                                            <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Item</th>
                                            <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-center">Qty</th>
                                            <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-right">Price</th>
                                            <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-right">Total</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-sidebar-border">
                                        {ITEMS && ITEMS.length > 0 ? (
                                            ITEMS.map((item: any) => (
                                                <tr key={item.ID || item.id} className="hover:bg-gray-50 dark:hover:bg-sidebar-accent/50 transition-colors">
                                                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                                                        <div className="font-medium">{item.ITEM_NAME || item.item_name}</div>
                                                        {(item.REASON || item.reason) && <div className="text-xs text-red-500 mt-0.5">Reason: {item.REASON || item.reason}</div>}
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-gray-900 dark:text-white">{item.QUANTITY || item.quantity}</td>
                                                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white">{formatCurrency(item.UNIT_PRICE || item.unit_price)}</td>
                                                    <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                                                        {formatCurrency((item.QUANTITY || item.quantity) * (item.UNIT_PRICE || item.unit_price))}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-4 text-center text-gray-500">No items found for this return.</td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Remarks */}
                            {REMARKS && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-lg p-4">
                                    <h4 className="text-xs font-bold text-yellow-800 dark:text-yellow-500 uppercase mb-1">Remarks</h4>
                                    <p className="text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed">
                                        {REMARKS}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex-shrink-0 p-6 border-t border-sidebar-border bg-gray-50 dark:bg-sidebar-accent rounded-b-xl flex justify-between items-center">
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Return
                        </button>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => onEdit(returnItem)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal Overlay */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white dark:bg-sidebar rounded-xl max-w-md w-full border border-sidebar-border shadow-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Return?</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Are you sure you want to delete <span className="font-mono font-medium text-gray-700 dark:text-gray-300">{REFERENCE_NO}</span>? This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
                            >
                                Yes, Delete It
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
