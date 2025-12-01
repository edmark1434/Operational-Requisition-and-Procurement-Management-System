import { useState } from 'react';
import {
    Mail,
    Phone,
    Package,
    DollarSign,
    CreditCard,
    Store,
    X,
    Edit3,
    Trash2,
    Building,
    Tag
} from 'lucide-react';
import { formatCurrency } from './utils/formatters';
import { router } from '@inertiajs/react';
import { supplierdelete, supplierdeleteModal, suppliers } from '@/routes';
import { toast, Toaster } from 'sonner';

interface SupplierDetailModalProps {
    supplier: any;
    isOpen: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: (id: number) => void;
}

export default function SupplierDetailModal({
                                                supplier,
                                                isOpen,
                                                onClose,
                                                onEdit,
                                                onDelete
                                            }: SupplierDetailModalProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = () => {
        router.delete(supplierdeleteModal(supplier.ID), {
            onSuccess: () => {
                setShowDeleteConfirm(false);
                toast('Vendor deleted successfully');
                router.visit(suppliers().url)
            }
        });
        setShowDeleteConfirm(false);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Main Modal */}
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-sidebar rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-sidebar-border">

                    {/* Header - Sticky */}
                    <div className="flex-shrink-0 p-6 border-b border-sidebar-border bg-white dark:bg-sidebar sticky top-0 z-10">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Supplier Details - {supplier?.NAME}
                            </h2>
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

                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Supplier ID
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white font-mono">
                                            #{supplier?.ID}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Supplier Name
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                                            {supplier?.NAME}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Contact Information
                                        </label>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-gray-500" />
                                                <a
                                                    href={`mailto:${supplier?.EMAIL}`}
                                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                                >
                                                    {supplier?.EMAIL}
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm text-gray-900 dark:text-white">
                                                    {supplier?.CONTACT_NUMBER}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Statistics Section */}
                            <div className="border-t border-sidebar-border pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Supplier Statistics
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 border border-sidebar-border rounded-lg">
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {supplier?.ITEM_COUNT}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Items Provided
                                        </p>
                                    </div>
                                    <div className="text-center p-4 border border-sidebar-border rounded-lg">
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(supplier?.TOTAL_ITEMS_VALUE || 0)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Total Inventory Value
                                        </p>
                                    </div>
                                    <div className="text-center p-4 border border-sidebar-border rounded-lg">
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <Tag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {supplier?.CATEGORIES?.length || 0}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Categories
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Categories Section */}
                            <div className="border-t border-sidebar-border pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Product Categories
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {supplier?.CATEGORIES?.map((category: string, index: number) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 dark:bg-sidebar text-gray-600 dark:text-gray-400 border border-sidebar-border"
                                        >
                                            {category}
                                        </span>
                                    ))}
                                    {(!supplier?.CATEGORIES || supplier.CATEGORIES.length === 0) && (
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            No categories assigned to this supplier
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Payment Options */}
                            <div className="border-t border-sidebar-border pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Payment Options
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {supplier?.ALLOWS_CASH && (
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                            Cash
                                        </span>
                                    )}
                                    {supplier?.ALLOWS_DISBURSEMENT && (
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            Disbursement
                                        </span>
                                    )}
                                    {supplier?.ALLOWS_STORE_CREDIT && (
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                            Store Credit
                                        </span>
                                    )}
                                    {!supplier?.ALLOWS_CASH && !supplier?.ALLOWS_DISBURSEMENT && !supplier?.ALLOWS_STORE_CREDIT && (
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            No payment options specified
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer with Actions */}
                    <div className="flex-shrink-0 p-6 border-t border-sidebar-border bg-gray-50 dark:bg-sidebar-accent">
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Supplier
                            </button>
                            <button
                                onClick={onEdit}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30"
                            >
                                <Edit3 className="w-4 h-4" />
                                Edit Supplier
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
                                Delete Supplier
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Are you sure you want to delete "{supplier?.NAME}"? This action cannot be undone and will affect all associated items.
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
                                Delete Supplier
                            </button>
                        </div>
                    </div>
                    <Toaster/>
                </div>
            )}
        </>
    );
}
