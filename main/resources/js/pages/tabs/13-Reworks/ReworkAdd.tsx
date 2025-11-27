import AppLayout from '@/layouts/app-layout';
import { reworks } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import reworksData from '@/pages/datasets/reworks';
import serviceData from '@/pages/datasets/service';
import reworkServiceData from '@/pages/datasets/rework_service';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reworks',
        href: reworks().url,
    },
    {
        title: 'Add New Rework',
        href: '/reworks/add',
    },
];

export default function ReworkAdd({ auth }: { auth: any }) {
    const [formData, setFormData] = useState({
        CREATED_AT: new Date().toISOString().split('T')[0],
        STATUS: 'pending',
        REMARKS: '',
        PO_ID: '',
        SUPPLIER_NAME: '',
        SERVICES: [] as any[]
    });

    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [availableServices, setAvailableServices] = useState<any[]>([]);
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [serviceQuantity, setServiceQuantity] = useState(1);

    useEffect(() => {
        // Load available services
        setAvailableServices(serviceData.filter(service => service.IS_ACTIVE));
    }, []);

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};

        if (!formData.PO_ID.trim()) {
            newErrors.PO_ID = 'PO ID is required';
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

    const handleAddService = () => {
        if (!selectedServiceId) return;

        const service = availableServices.find(s => s.ID.toString() === selectedServiceId);
        if (service && !formData.SERVICES.some(s => s.SERVICE_ID.toString() === selectedServiceId)) {
            const newService = {
                SERVICE_ID: parseInt(selectedServiceId),
                NAME: service.NAME,
                DESCRIPTION: service.DESCRIPTION,
                QUANTITY: serviceQuantity,
                UNIT_PRICE: service.HOURLY_RATE
            };

            setFormData(prev => ({
                ...prev,
                SERVICES: [...prev.SERVICES, newService]
            }));

            setSelectedServiceId('');
            setServiceQuantity(1);

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
            // Generate new rework ID
            const newReworkId = Math.max(...reworksData.map(rework => rework.ID), 0) + 1;

            // Prepare rework data
            const reworkDataToAdd = {
                ID: newReworkId,
                ...formData,
                PO_ID: parseInt(formData.PO_ID),
                CREATED_AT: formData.CREATED_AT
            };

            console.log('New Rework Data:', reworkDataToAdd);

            // In real application, you would send POST request to backend
            alert('Rework added successfully!');

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

    const handleReset = () => {
        setFormData({
            CREATED_AT: new Date().toISOString().split('T')[0],
            STATUS: 'pending',
            REMARKS: '',
            PO_ID: '',
            SUPPLIER_NAME: '',
            SERVICES: []
        });
        setErrors({});
        setSelectedServiceId('');
        setServiceQuantity(1);
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add New Rework" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Rework</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Create a new rework request
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
                <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-[oklch(0.145_0_0)]">
                    <div className="h-full overflow-y-auto">
                        <div className="min-h-full flex items-start justify-center p-6">
                            <div className="w-full max-w-4xl bg-white dark:bg-background rounded-xl border border-sidebar-border/70 shadow-lg">
                                {/* Header Section */}
                                <div className="border-b border-sidebar-border/70 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        New Rework Details
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Fill in the details below to create a new rework request
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
                                                        PO ID <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        required
                                                        value={formData.PO_ID}
                                                        onChange={(e) => handleInputChange('PO_ID', e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                            errors.PO_ID ? 'border-red-500' : 'border-sidebar-border'
                                                        }`}
                                                        placeholder="Enter PO ID"
                                                    />
                                                    {errors.PO_ID && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.PO_ID}</p>
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
                                                    placeholder="Enter supplier name"
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
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border">
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

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Quantity
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={serviceQuantity}
                                                        onChange={(e) => setServiceQuantity(parseInt(e.target.value) || 1)}
                                                        className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                    />
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
                                                        No services added yet
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

                                            {/* Add Rework Button */}
                                            <button
                                                type="submit"
                                                className="flex-1 max-w-xs bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                            >
                                                Add Rework
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
