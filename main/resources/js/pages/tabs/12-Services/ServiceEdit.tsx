import AppLayout from '@/layouts/app-layout';
import {servicedelete, serviceput, services} from '@/routes';
import { type BreadcrumbItem } from '@/types';
import {Head, Link, router, usePage} from '@inertiajs/react';
import { useState, useEffect } from 'react';

interface ServiceEditProps {
    auth: any;
    serviceId: number;
}

const breadcrumbs = (serviceId: number): BreadcrumbItem[] => [
    {
        title: 'Services',
        href: services().url,
    },
    {
        title: `Edit Service #${serviceId}`,
        href: `/services/${serviceId}/edit`,
    },
];

type Service = {
    id: number;
    name: string;
    description: string;
    hourly_rate: number;
    is_active: boolean;
    category_id: number;
    vendor_id: number | null;
    category: string;
    vendor: string | null;
    vendor_contact_num: string | null;
    vendor_email: string | null;
};

type Category = {
    id: number;
    name: string;
    description: string;
    type: 'Items' | 'Services';
    is_active: boolean;
};

type Vendor = {
    id: number;
    name: string;
    email: string;
    contact_number: string | null;
    allows_cash: boolean;
    allows_disbursement: boolean;
    allows_store_credit: boolean;
    is_active: boolean;
};

export default function ServiceEdit({ serviceId }: ServiceEditProps) {
    const { service, categories, vendors } = usePage<{
        service: Service;
        categories: Category[];
        vendors: Vendor[];
    }>().props;
    const [formData, setFormData] = useState({
        NAME: '',
        DESCRIPTION: '',
        HOURLY_RATE: 0,
        CATEGORY: '',
        VENDOR_ID: ''
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load service data on component mount
    useEffect(() => {
        loadServiceData();
    }, [serviceId]);

    const loadServiceData = () => {
        setIsLoading(true);

        try {
            if (!service) {
                console.error(`Service #${serviceId} not found`);
                alert('Service not found!');
                router.visit(services().url);
                return;
            }

            setFormData({
                NAME: service.name || '',
                DESCRIPTION: service.description || '',
                HOURLY_RATE: service.hourly_rate || 0,
                CATEGORY: service.category_id.toString() || '',
                VENDOR_ID: service.vendor_id?.toString() || '',
            });
        } catch (error) {
            console.error('Error loading service data:', error);
            alert('Error loading service data!');
            router.visit(services().url);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare updated service data
        const updatedServiceData = {
            ...formData,
            HOURLY_RATE: formData.HOURLY_RATE,
            CATEGORY_ID: parseInt(formData.CATEGORY),
            VENDOR_ID: formData.VENDOR_ID ? parseInt(formData.VENDOR_ID) : null,
        };

        router.put(serviceput(serviceId).url, updatedServiceData);
        alert('Service updated successfully!');

        // Redirect back to services list
        router.visit(services().url);
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDelete = () => {
        router.delete(servicedelete(serviceId).url);
        alert('Service deleted successfully!');
        router.visit(services().url);
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.visit(services().url);
        }
    };

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs(serviceId)}>
                <Head title="Edit Service" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Edit Service</h1>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading service data...</p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs(serviceId)}>
                <Head title="Edit Service" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Edit Service</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Editing Service #{serviceId}
                            </p>
                        </div>
                        <Link
                            href={services().url}
                            className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                        >
                            Return to Services
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
                                            Edit Service #{serviceId}
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Update the service details below
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="p-6">
                                        <div className="space-y-6">
                                            {/* Basic Information */}
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    Basic Information
                                                </h3>

                                                <div className="grid grid-cols-1 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Service Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={formData.NAME}
                                                            onChange={(e) => handleInputChange('NAME', e.target.value)}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                            placeholder="Enter service name"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Description *
                                                        </label>
                                                        <textarea
                                                            required
                                                            value={formData.DESCRIPTION}
                                                            onChange={(e) => handleInputChange('DESCRIPTION', e.target.value)}
                                                            rows={3}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                            placeholder="Describe the service..."
                                                        />
                                                    </div>
                                                </div>

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
                                                            {categories.map(category => (
                                                                <option key={category.id} value={category.id}>
                                                                    {category.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Hourly Rate *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            required
                                                            min="0"
                                                            step="0.01"
                                                            value={formData.HOURLY_RATE}
                                                            onChange={(e) => handleInputChange('HOURLY_RATE', parseFloat(e.target.value))}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Vendor Information */}
                                            <div className="border-t border-sidebar-border pt-6">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                    Vendor Information
                                                </h3>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Vendor *
                                                        </label>
                                                        <select
                                                            value={formData.VENDOR_ID}
                                                            onChange={(e) => handleInputChange('VENDOR_ID', e.target.value)}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                        >
                                                            <option value="">Select a vendor</option>
                                                            {vendors.map(vendor => (
                                                                <option key={vendor.id} value={vendor.id}>
                                                                    {vendor.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Display selected vendor info */}
                                                    {formData.VENDOR_ID && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                    Email
                                                                </label>
                                                                <p className="text-sm text-gray-900 dark:text-white">
                                                                    {vendors.find(v => v.id.toString() === formData.VENDOR_ID)?.email || 'N/A'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                    Contact Number
                                                                </label>
                                                                <p className="text-sm text-gray-900 dark:text-white">
                                                                    {vendors.find(v => v.id.toString() === formData.VENDOR_ID)?.contact_number || 'N/A'}
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
                                                    Delete Service
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
                                Delete Service
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
                                Delete Service
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
