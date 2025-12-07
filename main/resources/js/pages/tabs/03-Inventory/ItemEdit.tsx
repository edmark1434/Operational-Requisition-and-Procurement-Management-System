// ItemEdit.tsx
import AppLayout from '@/layouts/app-layout';
import { inventory, inventoryDelete, inventoryUpdate } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import CATEGORY_OPTIONS from '@/pages/datasets/category';
import SUPPLIER_OPTIONS from '@/pages/datasets/supplier';
import itemsData from "@/pages/datasets/items";
import { toast, Toaster } from 'sonner';

interface ItemEditProps {
    auth: any;
    itemId: number;
    item: any,
    CATEGORY_OPTIONS:any[]
}

const breadcrumbs = (itemId: number): BreadcrumbItem[] => [
    {
        title: 'Inventory',
        href: inventory().url,
    },
    {
        title: `Edit Item #${itemId}`,
        href: `/inventory/${itemId}/edit`,
    },
];

export default function ItemEdit({ auth, itemId,item,CATEGORY_OPTIONS }: ItemEditProps) {
    const [formData, setFormData] = useState({
        NAME: '',
        BARCODE: '',
        CATEGORY: '',
        UNIT_PRICE: 0,
        CURRENT_STOCK: 0,
        DIMENSIONS: '',
        MAKE_ID: 1,
        SUPPLIER_ID: '',
        SUPPLIER_NAME: '',
        SUPPLIER_EMAIL: '',
        SUPPLIER_CONTACT_NUMBER: ''
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setFormData(item);
        setIsLoading(false);
    }, []);

    const handleSupplierChange = (supplierId: string) => {
        const selectedSupplier = SUPPLIER_OPTIONS.find(s => s.ID.toString() === supplierId);
        if (selectedSupplier) {
            setFormData(prev => ({
                ...prev,
                SUPPLIER_ID: supplierId,
                SUPPLIER_NAME: selectedSupplier.NAME,
                SUPPLIER_EMAIL: selectedSupplier.EMAIL,
                SUPPLIER_CONTACT_NUMBER: selectedSupplier.CONTACT_NUMBER
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare updated item data
        const updatedItemData = {
            ...formData,
            CATEGORY_ID: CATEGORY_OPTIONS.find(cat => cat.NAME === formData.CATEGORY)?.CAT_ID || 1,
            SUPPLIER_ID: parseInt(formData.SUPPLIER_ID),
        };
        router.put(inventoryUpdate(itemId), updatedItemData, {
            onError: (err) => {
                console.log(err);
            }
        });

    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDelete = () => {
        router.delete(inventoryDelete(itemId));
        setShowDeleteConfirm(false);
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.visit(inventory().url);
        }
    };

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs(itemId)}>
                <Head title="Edit Item" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Edit Item</h1>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading item data...</p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs(itemId)}>
                <Head title="Edit Item" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Edit Item</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Editing Item #{itemId}
                            </p>
                        </div>
                        <Link
                            href={inventory().url}
                            className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                        >
                            Return to Inventory
                        </Link>
                    </div>

                    {/* Form Container */}
                    <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-white dark:bg-sidebar">
                        <div className="h-full overflow-y-auto">
                            <div className="min-h-full flex items-start justify-center p-6">
                                <div className="w-full max-w-4xl bg-white dark:bg-background rounded-xl border border-sidebar-border/70 shadow-lg">
                                    {/* Header Section */}
                                    <div className="border-b border-sidebar-border/70 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            Edit Item #{itemId}
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Update the item details below
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="p-6">
                                        <div className="space-y-6">
                                            {/* Basic Information */}
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    Basic Information
                                                </h3>

                                                {/* Row 1: Name and Barcode */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Item Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={formData.NAME}
                                                            onChange={(e) => handleInputChange('NAME', e.target.value)}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                            placeholder="Enter item name"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Barcode
                                                        </label>
                                                        <input
                                                            type="text"
                                                            readOnly
                                                            value={formData.BARCODE}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm bg-gray-50 dark:bg-input text-gray-900 dark:text-white font-mono cursor-not-allowed"
                                                        />
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            Barcode cannot be edited
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Row 2: Category and Make */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Category *
                                                        </label>
                                                        <select
                                                            required
                                                            value={formData.CATEGORY}
                                                            onChange={(e) => handleInputChange('CATEGORY', e.target.value)}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                        >
                                                            <option value="">Select a category</option>
                                                            {CATEGORY_OPTIONS.map(category => (
                                                                <option key={category.CAT_ID} value={category.NAME}>
                                                                    {category.NAME}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Make *
                                                        </label>
                                                        <select
                                                            required
                                                            value={formData.CATEGORY}
                                                            onChange={(e) => handleInputChange('CATEGORY', e.target.value)}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                        >
                                                            <option value="">Select a category</option>
                                                            {CATEGORY_OPTIONS.map(category => (
                                                                <option key={category.CAT_ID} value={category.NAME}>
                                                                    {category.NAME}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Row 3: Unit Price and Current Stock */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Unit Price *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            required
                                                            min="0"
                                                            step="0.01"
                                                            value={formData.UNIT_PRICE}
                                                            onChange={(e) => handleInputChange('UNIT_PRICE', parseFloat(e.target.value))}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                            placeholder="0.00"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Current Stock *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            required
                                                            min="0"
                                                            value={formData.CURRENT_STOCK}
                                                            onChange={(e) => handleInputChange('CURRENT_STOCK', parseInt(e.target.value))}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Row 4: Dimensions (Full Width) */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Dimensions
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.DIMENSIONS}
                                                        onChange={(e) => handleInputChange('DIMENSIONS', e.target.value)}
                                                        className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                        placeholder="e.g., 30cm x 15cm x 5cm"
                                                    />
                                                </div>
                                            </div>

                                            {/* Supplier Information */}
                                            <div className="border-t border-sidebar-border pt-6">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                    Supplier Information
                                                </h3>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Supplier *
                                                        </label>
                                                        <select
                                                            required
                                                            value={formData.SUPPLIER_ID}
                                                            onChange={(e) => handleSupplierChange(e.target.value)}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                        >
                                                            <option value="">Select a supplier</option>
                                                            {SUPPLIER_OPTIONS.map(supplier => (
                                                                <option key={supplier.ID} value={supplier.ID}>
                                                                    {supplier.NAME}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Display selected supplier info */}
                                                    {formData.SUPPLIER_ID && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                    Email
                                                                </label>
                                                                <p className="text-sm text-gray-900 dark:text-white">
                                                                    {formData.SUPPLIER_EMAIL}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                    Contact Number
                                                                </label>
                                                                <p className="text-sm text-gray-900 dark:text-white">
                                                                    {formData.SUPPLIER_CONTACT_NUMBER}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="sticky bottom-0 bg-white dark:bg-background pt-6 pb-2 border-t border-sidebar-border/70 -mx-6 px-6 mt-8">
                                            <div className="flex justify-between items-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowDeleteConfirm(true)}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete Item
                                                </button>
                                                <div className="flex gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={handleCancel}
                                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                                    >
                                                        Save Changes
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Toaster/>
            </AppLayout>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-sidebar rounded-xl max-w-md w-full border border-sidebar-border">
                        <div className="p-6 border-b border-sidebar-border">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Delete Item
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Are you sure you want to delete "{formData.NAME}"? This action cannot be undone.
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
                    </div>
                </div>
            )}
        </>
    );
}
