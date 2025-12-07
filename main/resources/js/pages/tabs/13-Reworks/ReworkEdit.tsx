import AppLayout from '@/layouts/app-layout';
import { reworks } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import reworksData from '@/pages/datasets/reworks';
import deliveryData from '@/pages/datasets/delivery';

interface ReworkEditProps {
    auth: any;
    reworkId: number;
}

const breadcrumbs = (reworkId: number): BreadcrumbItem[] => [
    {
        title: 'Reworks',
        href: reworks().url,
    },
    {
        title: `Edit Rework #${reworkId}`,
        href: `/reworks/${reworkId}/edit`,
    },
];

export default function ReworkEdit({ auth, reworkId }: ReworkEditProps) {
    const [formData, setFormData] = useState({
        CREATED_AT: '',
        STATUS: '',
        REMARKS: '',
        DELIVERY_ID: '',
        SUPPLIER_NAME: ''
    });

    const [selectedServices, setSelectedServices] = useState<any[]>([]);
    const [availableDeliveries, setAvailableDeliveries] = useState<any[]>([]);
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setAvailableDeliveries(deliveryData);
        loadReworkData();
    }, [reworkId]);

    const loadReworkData = () => {
        setIsLoading(true);

        try {
            const rework = reworksData.find(rework => rework.ID === reworkId);

            if (!rework) {
                console.error(`Rework #${reworkId} not found`);
                alert('Rework not found!');
                router.visit(reworks().url);
                return;
            }

            setFormData({
                CREATED_AT: rework.CREATED_AT,
                STATUS: rework.STATUS,
                REMARKS: rework.REMARKS || '',
                DELIVERY_ID: rework.DELIVERY_ID?.toString() || '',
                SUPPLIER_NAME: rework.SUPPLIER_NAME || ''
            });

            // Hydrate selected services
            if (rework.SERVICES) {
                const hydratedServices = rework.SERVICES.map((s: any) => ({
                    SERVICE_ID: s.SERVICE_ID,
                    SERVICE_NAME: s.NAME || 'Unknown Service',
                    QUANTITY: s.QUANTITY, // Should likely be 1 based on new logic
                    UNIT_PRICE: s.UNIT_PRICE || 0
                }));
                setSelectedServices(hydratedServices);
            }

        } catch (error) {
            console.error('Error loading rework data:', error);
            alert('Error loading rework data!');
            router.visit(reworks().url);
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};
        if (!formData.DELIVERY_ID) newErrors.DELIVERY_ID = 'Delivery reference required';
        if (!formData.REMARKS.trim()) newErrors.REMARKS = 'Remarks required';
        if (selectedServices.length === 0) newErrors.services = 'At least one service required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleDeliveryChange = (deliveryId: string) => {
        const selectedDelivery = availableDeliveries.find(d => d.ID.toString() === deliveryId);
        setFormData(prev => ({
            ...prev,
            DELIVERY_ID: deliveryId,
            SUPPLIER_NAME: selectedDelivery?.SUPPLIER_NAME || ''
        }));
        if (errors.DELIVERY_ID) setErrors(prev => ({ ...prev, DELIVERY_ID: '' }));
    };

    const handleRemoveService = (serviceId: number) => {
        setSelectedServices(prev => prev.filter(s => s.SERVICE_ID !== serviceId));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            const updatedRework = {
                ...formData,
                DELIVERY_ID: parseInt(formData.DELIVERY_ID),
                SERVICES: selectedServices,
                UPDATED_AT: new Date().toISOString()
            };
            console.log('Updated Rework:', updatedRework);
            alert('Rework updated successfully!');
            router.visit(reworks().url);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleDelete = () => {
        console.log('Deleting rework:', reworkId);
        alert('Rework deleted successfully!');
        setShowDeleteConfirm(false);
        router.visit(reworks().url);
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.visit(reworks().url);
        }
    };

    const getTotalValue = () => {
        return selectedServices.reduce((total, s) => total + (s.QUANTITY * s.UNIT_PRICE), 0);
    };

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs(reworkId)}>
                <Head title="Edit Rework" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Edit Rework</h1>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading rework data...</p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs(reworkId)}>
                <Head title="Edit Rework" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Rework</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Editing Rework #{reworkId}
                            </p>
                        </div>
                        <Link
                            href={reworks().url}
                            className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                        >
                            Return to Reworks
                        </Link>
                    </div>

                    {/* Form Container */}
                    <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-white dark:bg-sidebar">
                        <div className="h-full overflow-y-auto">
                            <div className="min-h-full flex items-start justify-center p-6">
                                <div className="w-full max-w-6xl bg-white dark:bg-background rounded-xl border border-sidebar-border/70 shadow-lg">
                                    {/* Header Section */}
                                    <div className="border-b border-sidebar-border/70 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            Edit Rework #{reworkId}
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Update the rework details below
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="p-6">
                                        <div className="space-y-8">
                                            {/* Basic Information */}
                                            <div className="space-y-6">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-3">
                                                    Basic Information
                                                </h3>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Status <span className="text-red-500">*</span>
                                                        </label>
                                                        <select
                                                            required
                                                            value={formData.STATUS}
                                                            onChange={(e) => handleInputChange('STATUS', e.target.value)}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white capitalize"
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="in_progress">In Progress</option>
                                                            <option value="completed">Completed</option>
                                                            <option value="cancelled">Cancelled</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Date Created
                                                        </label>
                                                        <input
                                                            type="text"
                                                            readOnly
                                                            value={formData.CREATED_AT}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm bg-gray-50 dark:bg-input text-gray-900 dark:text-white cursor-not-allowed"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Delivery Reference <span className="text-red-500">*</span>
                                                        </label>
                                                        <select
                                                            required
                                                            value={formData.DELIVERY_ID}
                                                            onChange={(e) => handleDeliveryChange(e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                                errors.DELIVERY_ID ? 'border-red-500' : 'border-sidebar-border'
                                                            }`}
                                                        >
                                                            <option value="">Select a delivery</option>
                                                            {availableDeliveries.map(delivery => (
                                                                <option key={delivery.ID} value={delivery.ID}>
                                                                    {delivery.REFERENCE_NO} - {delivery.SUPPLIER_NAME}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {errors.DELIVERY_ID && (
                                                            <p className="text-red-500 text-xs mt-1">{errors.DELIVERY_ID}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Delivery Info Card */}
                                                {formData.DELIVERY_ID && (
                                                    <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border p-4">
                                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                            Delivery Information
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <span className="text-xs text-gray-600 dark:text-gray-400">Supplier:</span>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {formData.SUPPLIER_NAME}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Services Section */}
                                            <div className="space-y-6">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-3">
                                                    Services to Rework
                                                </h3>

                                                {errors.services && (
                                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                                        <p className="text-sm text-red-600 dark:text-red-400">{errors.services}</p>
                                                    </div>
                                                )}

                                                {selectedServices.length === 0 ? (
                                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                                        No services selected for rework
                                                    </div>
                                                ) : (
                                                    <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border overflow-hidden">
                                                        <div className="bg-gray-50 dark:bg-sidebar-accent px-4 py-3 border-b border-sidebar-border">
                                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                                                Current Selections ({selectedServices.length})
                                                            </h4>
                                                        </div>
                                                        <div className="divide-y divide-sidebar-border">
                                                            {selectedServices.map((service, index) => (
                                                                <div key={service.SERVICE_ID} className="p-4 flex justify-between items-center">

                                                                    <div className="flex-1">
                                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                                            {service.SERVICE_NAME}
                                                                        </p>
                                                                        <div className="flex gap-4 mt-1">
                                                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                                Rate: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(service.UNIT_PRICE)}
                                                                            </p>
                                                                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                                                                Total Value: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(service.UNIT_PRICE)}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveService(service.SERVICE_ID)}
                                                                        className="ml-4 p-2 text-red-600 hover:text-red-700 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                                        title="Remove Service"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Total Summary Footer */}
                                                        <div className="bg-gray-50 dark:bg-sidebar-accent px-4 py-3 border-t border-sidebar-border">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm font-medium text-gray-900 dark:text-white">Total Value:</span>
                                                                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(getTotalValue())}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Remarks */}
                                            <div className="space-y-6">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-3">
                                                    Additional Information
                                                </h3>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Remarks <span className="text-red-500">*</span>
                                                    </label>
                                                    <textarea
                                                        required
                                                        value={formData.REMARKS}
                                                        onChange={(e) => handleInputChange('REMARKS', e.target.value)}
                                                        placeholder="Additional notes..."
                                                        rows={3}
                                                        className={`w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                            errors.REMARKS ? 'border-red-500' : 'border-sidebar-border'
                                                        }`}
                                                    />
                                                    {errors.REMARKS && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.REMARKS}</p>
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
                                                    Delete Rework
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
                                Delete Rework
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Are you sure you want to delete rework #{reworkId}? This action cannot be undone.
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
                                Delete Rework
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
