import AppLayout from '@/layouts/app-layout';
import { reworks } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import reworksData from '@/pages/datasets/reworks';
import serviceData from '@/pages/datasets/service';
import reworkServiceData from '@/pages/datasets/rework_service';
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
        SUPPLIER_NAME: '',
        SERVICES: [] as any[]
    });

    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [availableServices, setAvailableServices] = useState<any[]>([]);
    const [availableDeliveries, setAvailableDeliveries] = useState<any[]>([]);
    const [selectedServiceId, setSelectedServiceId] = useState('');

    // Load rework data on component mount
    useEffect(() => {
        loadReworkData();
        setAvailableServices(serviceData.filter(service => service.IS_ACTIVE));
        setAvailableDeliveries(deliveryData);
    }, [reworkId]);

    const loadReworkData = () => {
        setIsLoading(true);

        try {
            // Find the rework to edit
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
                SUPPLIER_NAME: rework.SUPPLIER_NAME || '',
                SERVICES: rework.SERVICES || []
            });
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

        if (!formData.DELIVERY_ID.trim()) {
            newErrors.DELIVERY_ID = 'Please select a delivery';
        }

        if (!formData.SUPPLIER_NAME.trim()) {
            newErrors.SUPPLIER_NAME = 'Supplier name is required';
        }

        if (!formData.REMARKS.trim()) {
            newErrors.REMARKS = 'Remarks are required';
        }

        if (formData.SERVICES.length === 0) {
            newErrors.SERVICES = 'At least one service is required';
        }

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

        if (errors.DELIVERY_ID) {
            setErrors(prev => ({ ...prev, DELIVERY_ID: '' }));
        }
    };

    const handleAddService = () => {
        if (!selectedServiceId) return;

        const service = availableServices.find(s => s.ID.toString() === selectedServiceId);
        if (service && !formData.SERVICES.some(s => s.SERVICE_ID.toString() === selectedServiceId)) {
            const newService = {
                SERVICE_ID: parseInt(selectedServiceId),
                NAME: service.NAME,
                DESCRIPTION: service.DESCRIPTION,
                QUANTITY: 1,
                UNIT_PRICE: service.HOURLY_RATE
            };

            setFormData(prev => ({
                ...prev,
                SERVICES: [...prev.SERVICES, newService]
            }));

            setSelectedServiceId('');

            if (errors.SERVICES) {
                setErrors(prev => ({ ...prev, SERVICES: '' }));
            }
        }
    };

    const handleRemoveService = (serviceId: number) => {
        setFormData(prev => ({
            ...prev,
            SERVICES: prev.SERVICES.filter(s => s.SERVICE_ID !== serviceId)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            // Prepare updated rework data
            const updatedReworkData = {
                ...formData,
                DELIVERY_ID: parseInt(formData.DELIVERY_ID),
                UPDATED_AT: new Date().toISOString()
            };

            console.log('Updated Rework Data:', updatedReworkData);

            // In real application, you would send PATCH request to backend
            alert('Rework updated successfully!');

            // Redirect back to reworks list
            router.visit(reworks().url);
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

    const handleDelete = () => {
        console.log('Deleting rework:', reworkId);

        // In real application, you would send DELETE request to backend
        alert('Rework deleted successfully!');
        setShowDeleteConfirm(false);

        // Redirect back to reworks list
        router.visit(reworks().url);
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.visit(reworks().url);
        }
    };

    const calculateTotalCost = () => {
        return formData.SERVICES.reduce((total, service) =>
            total + (service.UNIT_PRICE * service.QUANTITY), 0
        );
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
                                <div className="w-full max-w-4xl bg-white dark:bg-background rounded-xl border border-sidebar-border/70 shadow-lg">
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
                                                            Delivery <span className="text-red-500">*</span>
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
                                                                    Delivery #{delivery.ID} - {delivery.SUPPLIER_NAME}
                                                                    {delivery.PO_ID && ` (PO: ${delivery.PO_ID})`}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {errors.DELIVERY_ID && (
                                                            <p className="text-red-500 text-xs mt-1">{errors.DELIVERY_ID}</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Created Date <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="date"
                                                            required
                                                            value={formData.CREATED_AT}
                                                            onChange={(e) => handleInputChange('CREATED_AT', e.target.value)}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Supplier Name <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.SUPPLIER_NAME}
                                                        onChange={(e) => handleInputChange('SUPPLIER_NAME', e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                            errors.SUPPLIER_NAME ? 'border-red-500' : 'border-sidebar-border'
                                                        }`}
                                                        placeholder="Supplier name will auto-populate when delivery is selected"
                                                        readOnly
                                                    />
                                                    {errors.SUPPLIER_NAME && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.SUPPLIER_NAME}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Status <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        required
                                                        value={formData.STATUS}
                                                        onChange={(e) => handleInputChange('STATUS', e.target.value)}
                                                        className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="in_progress">In Progress</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Remarks <span className="text-red-500">*</span>
                                                    </label>
                                                    <textarea
                                                        required
                                                        value={formData.REMARKS}
                                                        onChange={(e) => handleInputChange('REMARKS', e.target.value)}
                                                        rows={3}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                            errors.REMARKS ? 'border-red-500' : 'border-sidebar-border'
                                                        }`}
                                                        placeholder="Describe the rework requirements..."
                                                    />
                                                    {errors.REMARKS && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.REMARKS}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Services Section */}
                                            <div className="space-y-6">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-3">
                                                    Services
                                                </h3>

                                                {/* Add Service Form */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Service
                                                        </label>
                                                        <select
                                                            value={selectedServiceId}
                                                            onChange={(e) => setSelectedServiceId(e.target.value)}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                        >
                                                            <option value="">Select a service</option>
                                                            {availableServices.map(service => (
                                                                <option key={service.ID} value={service.ID}>
                                                                    {service.NAME} - ${service.HOURLY_RATE}/hr
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="flex items-end">
                                                        <button
                                                            type="button"
                                                            onClick={handleAddService}
                                                            disabled={!selectedServiceId}
                                                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                        >
                                                            Add Service
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Services List */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Selected Services {errors.SERVICES && (
                                                        <span className="text-red-500 text-xs"> - {errors.SERVICES}</span>
                                                    )}
                                                    </label>

                                                    {formData.SERVICES.length === 0 ? (
                                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                                            No services added
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            {formData.SERVICES.map((service, index) => (
                                                                <div key={index} className="flex justify-between items-center p-4 bg-white dark:bg-sidebar rounded-lg border border-sidebar-border">
                                                                    <div className="flex-1">
                                                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                                                            {service.NAME}
                                                                        </h4>
                                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                            {service.DESCRIPTION}
                                                                        </p>
                                                                        <div className="flex gap-4 mt-2 text-sm">
                                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                                Quantity: {service.QUANTITY}
                                                                            </span>
                                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                                Rate: ${service.UNIT_PRICE}/hr
                                                                            </span>
                                                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                                                Total: ${(service.UNIT_PRICE * service.QUANTITY).toFixed(2)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveService(service.SERVICE_ID)}
                                                                        className="ml-4 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Total Cost */}
                                                {formData.SERVICES.length > 0 && (
                                                    <div className="text-right p-4 bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border">
                                                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                            Total Cost: ${calculateTotalCost().toFixed(2)}
                                                        </span>
                                                    </div>
                                                )}
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
