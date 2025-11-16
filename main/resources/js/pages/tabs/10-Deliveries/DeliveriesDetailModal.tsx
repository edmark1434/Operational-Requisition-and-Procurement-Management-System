import { useState } from 'react';
import { DeliveriesIcons } from './utils/icons';
import { getDeliveriesStatusColor } from './utils/styleUtils';
import { formatCurrency, formatDate, formatDateTime } from './utils/formatters';

interface DeliveriesDetailModalProps {
    delivery: any;
    isOpen: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: (id: number) => void;
    onStatusChange: (deliveryId: number, newStatus: string) => void;
}

export default function DeliveriesDetailModal({
                                                  delivery,
                                                  isOpen,
                                                  onClose,
                                                  onEdit,
                                                  onDelete,
                                                  onStatusChange
                                              }: DeliveriesDetailModalProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = () => {
        if (delivery) {
            onDelete(delivery.ID);
        }
        setShowDeleteConfirm(false);
    };

    const handleStatusChange = (newStatus: string) => {
        onStatusChange(delivery.ID, newStatus);
    };

    const getStatusClasses = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
            case 'delivered':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800';
            case 'in-transit':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-700';
        }
    };

    if (!isOpen || !delivery) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-sidebar rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-sidebar-border">
                    {/* Header - Sticky */}
                    <div className="flex-shrink-0 p-6 border-b border-sidebar-border bg-white dark:bg-sidebar sticky top-0 z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Delivery #{delivery.RECEIPT_NO}
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Delivered on {formatDateTime(delivery.DELIVERY_DATE)}
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
                                        <select
                                            value={delivery.STATUS}
                                            onChange={(e) => handleStatusChange(e.target.value)}
                                            className={`w-full px-3 py-2 rounded-full text-sm font-medium border-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-colors ${getStatusClasses(delivery.STATUS)}`}
                                        >
                                            <option value="pending" className="bg-white dark:bg-input text-gray-900 dark:text-white">Pending</option>
                                            <option value="in-transit" className="bg-white dark:bg-input text-gray-900 dark:text-white">In Transit</option>
                                            <option value="delivered" className="bg-white dark:bg-input text-gray-900 dark:text-white">Delivered</option>
                                            <option value="cancelled" className="bg-white dark:bg-input text-gray-900 dark:text-white">Cancelled</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Receipt Number
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white font-medium font-mono">
                                            {delivery.RECEIPT_NO}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Delivery Date
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {formatDate(delivery.DELIVERY_DATE)}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Total Items
                                        </label>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                                            {delivery.TOTAL_ITEMS} items
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Total Value
                                        </label>
                                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                            {formatCurrency(delivery.TOTAL_VALUE)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Total Cost
                                        </label>
                                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                            {formatCurrency(delivery.TOTAL_COST)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Receipt Photo */}
                            {delivery.RECEIPT_PHOTO && (
                                <div className="border-t border-sidebar-border pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Receipt Photo
                                    </h3>
                                    <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border p-4">
                                        <img
                                            src={delivery.RECEIPT_PHOTO}
                                            alt="Delivery receipt"
                                            className="max-w-full h-auto rounded-lg max-h-64 object-contain"
                                        />
                                    </div>
                                </div>
                            )}

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
                                            {delivery.SUPPLIER_NAME}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Purchase Order Reference
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {delivery.PO_REFERENCE}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Items */}
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
                                        {delivery.ITEMS?.map((item: any) => (
                                            <tr key={item.ID} className="border-b border-sidebar-border last:border-b-0">
                                                <td className="p-3 text-sm text-gray-900 dark:text-white">{item.ITEM_NAME}</td>
                                                <td className="p-3 text-sm text-gray-900 dark:text-white">{item.QUANTITY}</td>
                                                <td className="p-3 text-sm text-gray-900 dark:text-white">{formatCurrency(item.UNIT_PRICE)}</td>
                                                <td className="p-3 text-sm text-gray-900 dark:text-white font-medium">
                                                    {formatCurrency(item.QUANTITY * item.UNIT_PRICE)}
                                                </td>
                                                <td className="p-3 text-sm text-gray-900 dark:text-white font-mono">{item.BARCODE}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Remarks */}
                            {delivery.REMARKS && (
                                <div className="border-t border-sidebar-border pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Remarks
                                    </h3>
                                    <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border p-4">
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {delivery.REMARKS}
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
                                Are you sure you want to delete delivery "{delivery.RECEIPT_NO}"? This action cannot be undone.
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
