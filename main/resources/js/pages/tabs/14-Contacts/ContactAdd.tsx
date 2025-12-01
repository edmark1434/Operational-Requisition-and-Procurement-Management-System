import AppLayout from '@/layouts/app-layout';
import { contacts, contactscreate } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import SUPPLIER_OPTIONS from '@/pages/datasets/supplier';
import contactData from "@/pages/datasets/contact";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Contacts',
        href: contacts().url,
    },
    {
        title: 'Add New Contact',
        href: '/contacts/add',
    },
];

export default function ContactAdd({ auth }: { auth: any }) {
    const [formData, setFormData] = useState({
        NAME: '',
        POSITION: '',
        EMAIL: '',
        CONTACT_NUMBER: '',
        VENDOR_ID: '',
        VENDOR_NAME: '',
        VENDOR_EMAIL: '',
        IS_ACTIVE: true
    });
    const [errors, setErrors] = useState<{[key: string]: string}>({});

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};

        if (!formData.NAME.trim()) {
            newErrors.NAME = 'Contact name is required';
        }

        if (!formData.POSITION.trim()) {
            newErrors.POSITION = 'Position is required';
        }

        if (!formData.EMAIL.trim()) {
            newErrors.EMAIL = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.EMAIL)) {
            newErrors.EMAIL = 'Email is invalid';
        }

        if (!formData.CONTACT_NUMBER.trim()) {
            newErrors.CONTACT_NUMBER = 'Contact number is required';
        }

        if (!formData.VENDOR_ID) {
            newErrors.VENDOR_ID = 'Vendor is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleVendorChange = (vendorId: string) => {
        const selectedVendor = SUPPLIER_OPTIONS.find(s => s.ID.toString() === vendorId);
        if (selectedVendor) {
            setFormData(prev => ({
                ...prev,
                VENDOR_ID: vendorId,
                VENDOR_NAME: selectedVendor.NAME,
                VENDOR_EMAIL: selectedVendor.EMAIL
            }));
            if (errors.VENDOR_ID) {
                setErrors(prev => ({ ...prev, VENDOR_ID: '' }));
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            const contactDataToAdd = {
                ...formData,
                VENDOR_ID: parseInt(formData.VENDOR_ID),
            };

            router.post(contactscreate(), contactDataToAdd);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleReset = () => {
        setFormData({
            NAME: '',
            POSITION: '',
            EMAIL: '',
            CONTACT_NUMBER: '',
            VENDOR_ID: '',
            VENDOR_NAME: '',
            VENDOR_EMAIL: '',
            IS_ACTIVE: true
        });
        setErrors({});
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.visit(contacts().url);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add New Contact" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Contact</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Add a new vendor contact to your directory
                        </p>
                    </div>
                    <Link
                        href={contacts().url}
                        className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                    >
                        Return to Contacts
                    </Link>
                </div>

                {/* Form Container */}
                <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-[oklch(0.145_0_0)]">
                    <div className="h-full overflow-y-auto">
                        <div className="min-h-full flex items-start justify-center p-6">
                            <div className="w-full max-w-4xl bg-white dark:bg-background rounded-xl border border-sidebar-border/70 shadow-lg">
                                {/* Header Section */}
                                <div className="border-b border-sidebar-border/70 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        New Contact Details
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Fill in the details below to add a new vendor contact
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6">
                                    <div className="space-y-8">
                                        {/* Contact Information */}
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-3">
                                                Contact Information
                                            </h3>

                                            <div className="grid grid-cols-1 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Full Name <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.NAME}
                                                        onChange={(e) => handleInputChange('NAME', e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                            errors.NAME ? 'border-red-500' : 'border-sidebar-border'
                                                        }`}
                                                        placeholder="Enter full name"
                                                    />
                                                    {errors.NAME && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.NAME}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Position <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.POSITION}
                                                        onChange={(e) => handleInputChange('POSITION', e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                            errors.POSITION ? 'border-red-500' : 'border-sidebar-border'
                                                        }`}
                                                        placeholder="Enter position/title"
                                                    />
                                                    {errors.POSITION && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.POSITION}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                        placeholder="email@company.com"
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
                                                        placeholder="(555) 123-4567"
                                                    />
                                                    {errors.CONTACT_NUMBER && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.CONTACT_NUMBER}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="is_active"
                                                    checked={formData.IS_ACTIVE}
                                                    onChange={(e) => handleInputChange('IS_ACTIVE', e.target.checked)}
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                />
                                                <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                    Active Contact
                                                </label>
                                            </div>
                                        </div>

                                        {/* Vendor Information */}
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-3">
                                                Vendor Information
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Vendor Company <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        required
                                                        value={formData.VENDOR_ID}
                                                        onChange={(e) => handleVendorChange(e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                            errors.VENDOR_ID ? 'border-red-500' : 'border-sidebar-border'
                                                        }`}
                                                    >
                                                        <option value="">Select a vendor</option>
                                                        {SUPPLIER_OPTIONS.map(vendor => (
                                                            <option key={vendor.ID} value={vendor.ID}>
                                                                {vendor.NAME}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors.VENDOR_ID && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.VENDOR_ID}</p>
                                                    )}
                                                </div>

                                                {/* Display selected vendor info */}
                                                {formData.VENDOR_ID && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                Company Email
                                                            </label>
                                                            <p className="text-sm text-gray-900 dark:text-white">
                                                                {formData.VENDOR_EMAIL}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                Company Contact
                                                            </label>
                                                            <p className="text-sm text-gray-900 dark:text-white">
                                                                {SUPPLIER_OPTIONS.find(v => v.ID.toString() === formData.VENDOR_ID)?.CONTACT_NUMBER}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="sticky bottom-0 bg-white dark:bg-background pt-6 pb-2 border-t border-sidebar-border/70 -mx-6 px-6 mt-8">
                                        <div className="flex gap-3 justify-between">
                                            <div className="flex gap-3">
                                                {/* Reset Button */}
                                                <div className="relative group">
                                                    <button
                                                        type="button"
                                                        onClick={handleReset}
                                                        className="w-12 h-12 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                        </svg>
                                                    </button>
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                                        Reset Form
                                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                                    </div>
                                                </div>

                                                {/* Cancel Button */}
                                                <div className="relative group">
                                                    <button
                                                        type="button"
                                                        onClick={handleCancel}
                                                        className="w-12 h-12 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                                        Cancel
                                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Add Contact Button */}
                                            <button
                                                type="submit"
                                                className="flex-1 max-w-xs bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                            >
                                                Add Contact
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
