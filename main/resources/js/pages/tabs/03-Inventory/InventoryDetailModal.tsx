import { useState, useEffect, Fragment } from 'react';
import { StatusIcons, StockIcons } from './utils/icons';
import { getStockStatusColor } from './utils/styleUtils';
import { formatCurrency, formatDate } from './utils/formatters';
import { router } from '@inertiajs/react';
import { toast, Toaster } from 'sonner';
import { inventory, inventoryDeleteModal } from '@/routes';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';

interface InventoryDetailModalProps {
    item: any;
    isOpen: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: (id: number) => void;
}

export default function InventoryDetailModal({
                                                 item,
                                                 isOpen,
                                                 onClose,
                                                 onEdit,
                                                 onDelete
                                             }: InventoryDetailModalProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const stockStatus = item?.CURRENT_STOCK === 0 ? 'out-of-stock' :
        item?.CURRENT_STOCK < 10 ? 'low-stock' : 'in-stock';

    const handleDelete = () => {
        router.delete(inventoryDeleteModal(item.ID), {
            onSuccess: () => {
                toast.success('Item deleted successfully');
                router.visit(inventory().url);
            },
            onError: (err) => {
                toast('error occurs ' + err);
            }
        })
        setShowDeleteConfirm(false);
    };

    if (!item) return null;

    return (
        <>
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={onClose}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-sidebar text-left align-middle shadow-xl transition-all border border-sidebar-border flex flex-col max-h-[90vh]">
                                    {/* Header - Sticky */}
                                    <div className="flex-shrink-0 p-6 border-b border-sidebar-border bg-white dark:bg-sidebar sticky top-0 z-10">
                                        <div className="flex items-center justify-between">
                                            <Dialog.Title as="h2" className="text-xl font-bold text-gray-900 dark:text-white">
                                                Item #{item?.ID} Details
                                            </Dialog.Title>
                                            <button
                                                onClick={onClose}
                                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                                            >
                                                <X className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content - Scrollable */}
                                    <div className="flex-1 overflow-y-auto">
                                        <div className="p-6 space-y-6 bg-white dark:bg-sidebar">
                                            {/* Basic Info */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Status
                                                        </label>
                                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStockStatusColor(stockStatus)}`}>
                                                            {StockIcons[stockStatus as keyof typeof StockIcons]}
                                                            {stockStatus === 'in-stock' ? 'In Stock' : stockStatus === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Item Name
                                                        </label>
                                                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                                                            {item?.NAME}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Barcode
                                                        </label>
                                                        <p className="text-sm text-gray-900 dark:text-white font-mono">
                                                            {item?.BARCODE}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Makes & Categories
                                                        </label>
                                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                                 {item?.MAKE_NAME || 'Unknown manufacturer'}
                                            </span>
                                                        <span className="inline-flex items-center px-2.5 py-0.5 ml-2  rounded-full text-xs font-medium bg-gray-50 dark:bg-sidebar text-gray-600 dark:text-gray-400 border border-sidebar-border">
                                        {item?.CATEGORY}
                                    </span>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Current Stock
                                                        </label>
                                                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                            {item?.CURRENT_STOCK} units
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Unit Price
                                                        </label>
                                                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                            {formatCurrency(item?.UNIT_PRICE || 0)}
                                                        </p>
                                                    </div>
                                                    {item?.DIMENSIONS && (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                Dimensions
                                                            </label>
                                                            <p className="text-sm text-gray-900 dark:text-white">
                                                                {item.DIMENSIONS}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Supplier Information */}
                                            <div className="border-t border-sidebar-border pt-6">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                    Vendor Information
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Supplier Name
                                                        </label>
                                                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                                                            {item?.SUPPLIER_NAME || 'No supplier assigned'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Email
                                                        </label>
                                                        <p className="text-sm text-blue-600 dark:text-blue-400">
                                                            {item?.SUPPLIER_EMAIL ? (
                                                                <a href={`mailto:${item.SUPPLIER_EMAIL}`} className="hover:underline">
                                                                    {item.SUPPLIER_EMAIL}
                                                                </a>
                                                            ) : 'No email provided'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Contact Number
                                                        </label>
                                                        <p className="text-sm text-gray-900 dark:text-white">
                                                            {item?.SUPPLIER_CONTACT_NUMBER || 'No contact number provided'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Payment Options
                                                        </label>
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            {item?.ALLOWS_CASH && (
                                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                Cash
                                            </span>
                                                            )}
                                                            {item?.ALLOWS_DISBURSEMENT && (
                                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                Disbursement
                                            </span>
                                                            )}
                                                            {item?.ALLOWS_STORE_CREDIT && (
                                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                                Store Credit
                                            </span>
                                                            )}
                                                            {!item?.ALLOWS_CASH && !item?.ALLOWS_DISBURSEMENT && !item?.ALLOWS_STORE_CREDIT && (
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                No payment options specified
                                            </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <Toaster/>
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
                                                Delete Item
                                            </button>
                                            <button
                                                onClick={onEdit}
                                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit Item
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Delete Confirmation Modal */}
            <Transition appear show={showDeleteConfirm} as={Fragment}>
                <Dialog as="div" className="relative z-[60]" onClose={() => setShowDeleteConfirm(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-sidebar text-left align-middle shadow-xl transition-all border border-sidebar-border">
                                    <div className="p-6 border-b border-sidebar-border">
                                        <Dialog.Title as="h2" className="text-xl font-bold text-gray-900 dark:text-white">
                                            Delete Item
                                        </Dialog.Title>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Are you sure you want to delete "{item?.NAME}"? This action cannot be undone.
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
                                            Delete Item
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
}
