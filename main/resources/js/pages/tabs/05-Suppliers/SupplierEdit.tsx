import AppLayout from '@/layouts/app-layout';
import { supplierdelete, suppliers, supplierupdate } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import suppliersData from '@/pages/datasets/supplier';
import categoriesData from '@/pages/datasets/category';
import categorySuppliersData from '@/pages/datasets/category_supplier';

interface SupplierEditProps {
    auth: any;
    supplierId: number;
    vendor: any,
    categoriesData : any[]
}

interface FormData {
    NAME: string;
    EMAIL: string;
    CONTACT_NUMBER: string;
    ALLOWS_CASH: boolean;
    ALLOWS_DISBURSEMENT: boolean;
    ALLOWS_STORE_CREDIT: boolean;
    CATEGORIES: number[];
}

const breadcrumbs = (supplierId: number): BreadcrumbItem[] => [
    {
        title: 'Suppliers',
        href: suppliers().url,
    },
    {
        title: `Edit Supplier #${supplierId}`,
        href: `/suppliers/${supplierId}/edit`,
    },
];

export default function SupplierEdit({ auth, supplierId,vendor,categoriesData }: SupplierEditProps) {
    const [formData, setFormData] = useState<FormData>({
        NAME: '',
        EMAIL: '',
        CONTACT_NUMBER: '',
        ALLOWS_CASH: false,
        ALLOWS_DISBURSEMENT: false,
        ALLOWS_STORE_CREDIT: false,
        CATEGORIES: [] as number[]
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load supplier data on component mount
    useEffect(() => {
        setFormData(vendor)
        setIsLoading(false)
    }, [vendor]);

    

    const handleCategoryToggle = (categoryId: number) => {
        setFormData(prev => ({
            ...prev,
            CATEGORIES: prev.CATEGORIES.includes(categoryId)
                ? prev.CATEGORIES.filter(id => id !== categoryId)
                : [...prev.CATEGORIES, categoryId]
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare updated supplier data
        const updatedSupplierData = {
            ...formData,
        };
        router.put(supplierupdate(supplierId),updatedSupplierData)
    };

    const handleInputChange = (field: keyof FormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCheckboxChange = (field: keyof FormData) => {
        setFormData(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleDelete = () => {
       
        router.delete(supplierdelete(supplierId));
        
        setShowDeleteConfirm(false);

    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.visit(suppliers().url);
        }
    };

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs(supplierId)}>
                <Head title="Edit Supplier" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Edit Supplier</h1>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading supplier data...</p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs(supplierId)}>
                <Head title="Edit Supplier" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Edit Supplier</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Editing Supplier #{supplierId}
                            </p>
                        </div>
                        <Link
                            href={suppliers().url}
                            className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                        >
                            Return to Suppliers
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
                                            Edit Supplier #{supplierId}
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Update the supplier details below
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="p-6">
                                        <div className="space-y-6">
                                            {/* Basic Information */}
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    Basic Information
                                                </h3>

                                                {/* Supplier Name - Full Width */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Supplier Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.NAME}
                                                        onChange={(e) => handleInputChange('NAME', e.target.value)}
                                                        className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                        placeholder="Enter supplier name"
                                                    />
                                                </div>

                                                {/* Email and Contact Number - Side by Side */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Email *
                                                        </label>
                                                        <input
                                                            type="email"
                                                            required
                                                            value={formData.EMAIL}
                                                            onChange={(e) => handleInputChange('EMAIL', e.target.value)}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                            placeholder="Enter email address"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Contact Number *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={formData.CONTACT_NUMBER}
                                                            onChange={(e) => handleInputChange('CONTACT_NUMBER', e.target.value)}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                            placeholder="Enter contact number"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Categories */}
                                            <div className="border-t border-sidebar-border pt-6">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                    Product Categories
                                                </h3>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {categoriesData.map(category => (
                                                        <label key={category.CAT_ID} className="flex items-center space-x-2 p-3 border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.CATEGORIES.includes(category.CAT_ID)}
                                                                onChange={() => handleCategoryToggle(category.CAT_ID)}
                                                                className="rounded border-sidebar-border text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                                {category.NAME}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Payment Options */}
                                            <div className="border-t border-sidebar-border pt-6">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                    Payment Options
                                                </h3>
                                                <div className="space-y-3">
                                                    <label className="flex items-center p-3 border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.ALLOWS_CASH}
                                                            onChange={() => handleCheckboxChange('ALLOWS_CASH')}
                                                            className="rounded border-sidebar-border text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                            Allows Cash Payments
                                                        </span>
                                                    </label>

                                                    <label className="flex items-center p-3 border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.ALLOWS_DISBURSEMENT}
                                                            onChange={() => handleCheckboxChange('ALLOWS_DISBURSEMENT')}
                                                            className="rounded border-sidebar-border text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                            Allows Disbursement
                                                        </span>
                                                    </label>

                                                    <label className="flex items-center p-3 border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.ALLOWS_STORE_CREDIT}
                                                            onChange={() => handleCheckboxChange('ALLOWS_STORE_CREDIT')}
                                                            className="rounded border-sidebar-border text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                            Allows Store Credit
                                                        </span>
                                                    </label>
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
                                                    Delete Supplier
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
            </AppLayout>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-sidebar rounded-xl max-w-md w-full border border-sidebar-border">
                        <div className="p-6 border-b border-sidebar-border">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Delete Supplier
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Are you sure you want to delete "{formData.NAME}"? This action cannot be undone and will affect all associated items.
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
                </div>
            )}
        </>
    );
}
