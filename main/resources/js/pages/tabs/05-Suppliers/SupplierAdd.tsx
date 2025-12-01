import AppLayout from '@/layouts/app-layout';
import { suppliercreate, suppliers } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import categoriesData from '@/pages/datasets/category';
import suppliersData from '@/pages/datasets/supplier';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Suppliers',
        href: suppliers().url,
    },
    {
        title: 'Add New Supplier',
        href: '/suppliers/add',
    },
];

interface FormData {
    NAME: string;
    EMAIL: string;
    CONTACT_NUMBER: string;
    ALLOWS_CASH: boolean;
    ALLOWS_DISBURSEMENT: boolean;
    ALLOWS_STORE_CREDIT: boolean;
    CATEGORIES: number[];
}
interface Prop{
    auth: any,
    suppliersData: any[],
    categoriesData: any[]
}

export default function SupplierAdd({auth,suppliersData,categoriesData}:Prop) {
    const [formData, setFormData] = useState<FormData>({
        NAME: '',
        EMAIL: '',
        CONTACT_NUMBER: '',
        ALLOWS_CASH: false,
        ALLOWS_DISBURSEMENT: false,
        ALLOWS_STORE_CREDIT: false,
        CATEGORIES: []
    });
    const [errors, setErrors] = useState<{[key: string]: string}>({});

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};

        if (!formData.NAME.trim()) {
            newErrors.NAME = 'Supplier name is required';
        }

        if (!formData.EMAIL.trim()) {
            newErrors.EMAIL = 'Email is required';
        }

        if (!formData.CONTACT_NUMBER.trim()) {
            newErrors.CONTACT_NUMBER = 'Contact number is required';
        }
        if (formData.CATEGORIES.length === 0) {
            newErrors.CATEGORY = 'At least one category is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

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

        if (validateForm()) {
            // Generate new supplier ID

            // Prepare supplier data
            const supplierData = {
                ...formData,
                
            };
            console.log(supplierData);
            router.post(suppliercreate(), supplierData);
        }
    };

    const handleInputChange = (field: keyof FormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleCheckboxChange = (field: keyof FormData) => {
        setFormData(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleReset = () => {
        setFormData({
            NAME: '',
            EMAIL: '',
            CONTACT_NUMBER: '',
            ALLOWS_CASH: false,
            ALLOWS_DISBURSEMENT: false,
            ALLOWS_STORE_CREDIT: false,
            CATEGORIES: []
        });
        setErrors({});
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.visit(suppliers().url);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add New Supplier" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Supplier</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Add a new supplier to your system
                        </p>
                    </div>
                    <Link
                        href={suppliers().url}
                        className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-gray-700"
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
                                        New Supplier Details
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Fill in the supplier information below
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
                                                    Supplier Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.NAME}
                                                    onChange={(e) => handleInputChange('NAME', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                        errors.NAME ? 'border-red-500' : 'border-sidebar-border'
                                                    }`}
                                                    placeholder="Enter supplier name"
                                                />
                                                {errors.NAME && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.NAME}</p>
                                                )}
                                            </div>

                                            {/* Email and Contact Number - Side by Side */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Email <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="email"
                                                        required
                                                        value={formData.EMAIL}
                                                        onChange={(e) => handleInputChange('EMAIL', e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                            errors.EMAIL ? 'border-red-500' : 'border-sidebar-border'
                                                        }`}
                                                        placeholder="Enter email address"
                                                    />
                                                    {errors.EMAIL && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.EMAIL}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Contact Number <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.CONTACT_NUMBER}
                                                        onChange={(e) => handleInputChange('CONTACT_NUMBER', e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                            errors.CONTACT_NUMBER ? 'border-red-500' : 'border-sidebar-border'
                                                        }`}
                                                        placeholder="Enter contact number"
                                                    />
                                                    {errors.CONTACT_NUMBER && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.CONTACT_NUMBER}</p>
                                                    )}
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
                                            {errors.CATEGORY && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.CATEGORY}</p>
                                                    )}
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
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={handleReset}
                                                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                            >
                                                Reset Form
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                            >
                                                Add Supplier
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
