import AppLayout from '@/layouts/app-layout';
import { reworks } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

// Remove dummy data import
// import deliveryData from '@/pages/datasets/delivery';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reworks', href: '/reworks' }, // Fixed href
    { title: 'Create Rework', href: '/reworks/add' },
];

// Interface for props passed from Laravel
interface Props {
    auth: any;
    deliveries: any[]; // Passed from Controller
}

export default function ReworkAdd({ auth, deliveries }: Props) {

    // Form State
    const [formData, setFormData] = useState({
        DELIVERY_ID: '',
        REFERENCE_NO: '',
        CREATED_AT: new Date().toISOString().split('T')[0],
        STATUS: 'pending',
        REMARKS: '',
        SUPPLIER_NAME: ''
    });

    // Services selected for rework
    const [selectedServices, setSelectedServices] = useState<Array<{
        SERVICE_ID: number;
        SERVICE_NAME: string;
        QUANTITY: number;
        UNIT_PRICE: number;
    }>>([]);

    // Data States
    // Initialize with prop data
    const [availableDeliveries, setAvailableDeliveries] = useState<any[]>(deliveries);
    const [availableServices, setAvailableServices] = useState<any[]>([]);
    const [isLoadingServices, setIsLoadingServices] = useState(false);
    const [errors, setErrors] = useState<{[key: string]: string}>({});

    useEffect(() => {
        // If deliveries update via props, update state
        const filteredDeliveries = deliveries.filter(d => d.TYPE.includes('Service'));
        setAvailableDeliveries(filteredDeliveries);

        const timestamp = new Date().getTime();
        setFormData(prev => ({ ...prev, REFERENCE_NO: `RW-DRAFT-${timestamp}`.slice(0, 18) }));
    }, [deliveries]);

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};
        if (!formData.DELIVERY_ID) newErrors.DELIVERY_ID = 'Delivery reference is required';
        if (!formData.REMARKS.trim()) newErrors.REMARKS = 'Remarks are required';
        if (selectedServices.length === 0) newErrors.services = 'At least one service must be selected';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 1. Fetch Services when Delivery is selected
    const handleDeliveryChange = async (deliveryId: string) => {
        const selectedDelivery = availableDeliveries.find(d => d.ID.toString() === deliveryId);

        setFormData(prev => ({
            ...prev,
            DELIVERY_ID: deliveryId,
            SUPPLIER_NAME: selectedDelivery?.SUPPLIER_NAME || ''
        }));

        // Reset lists
        setSelectedServices([]);
        setAvailableServices([]);
        if (errors.DELIVERY_ID) setErrors(prev => ({ ...prev, DELIVERY_ID: '' }));

        if (!deliveryId) return;

        setIsLoadingServices(true);

        try {
            // UPDATED API ROUTE
            const response = await axios.get(`/api/reworks/delivery/${deliveryId}/services`);
            if (Array.isArray(response.data)) {
                setAvailableServices(response.data);
            }
        } catch (error) {
            console.error("Failed to load delivery services", error);
        } finally {
            setIsLoadingServices(false);
        }
    };

    // 2. Add Service
    const handleAddService = (service: any) => {
        const existing = selectedServices.find(s => s.SERVICE_ID === service.item_id);

        if (!existing) {
            setSelectedServices(prev => [...prev, {
                SERVICE_ID: service.item_id,
                SERVICE_NAME: service.item_name,
                QUANTITY: 1,
                UNIT_PRICE: Number(service.unit_price)
            }]);
        }
        if (errors.services) setErrors(prev => ({ ...prev, services: '' }));
    };

    // 3. Remove Service
    const handleRemoveService = (serviceId: number) => {
        setSelectedServices(prev => prev.filter(s => s.SERVICE_ID !== serviceId));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            const payload = {
                delivery_id: formData.DELIVERY_ID,
                remarks: formData.REMARKS,
                services: selectedServices.map(s => ({
                    service_id: s.SERVICE_ID,
                    quantity: s.QUANTITY
                }))
            };

            // Use Inertia Router for submission
            router.post('/reworks', payload, {
                onSuccess: () => {
                    // Optional: Toast notification here
                },
                onError: (err) => {
                    console.error(err);
                    alert("Error submitting form");
                }
            });
        }
    };

    // ... Rest of your UI render code (handleReset, handleCancel, JSX) remains exactly the same ...
    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleReset = () => {
        if (selectedServices.length > 0 && !window.confirm('Reset form? All selections will be cleared.')) return;
        setFormData(prev => ({
            ...prev,
            DELIVERY_ID: '',
            REMARKS: '',
            STATUS: 'pending',
            SUPPLIER_NAME: ''
        }));
        setSelectedServices([]);
        setAvailableServices([]);
        setErrors({});
    };

    const handleCancel = () => {
        router.visit('/reworks');
    };

    const getTotalValue = () => {
        return selectedServices.reduce((total, s) => total + (s.QUANTITY * s.UNIT_PRICE), 0);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Rework" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* ... Your exact existing JSX structure ... */}
                {/* Just ensure `value={formData.DELIVERY_ID}` matches the select logic */}

                {/* Main Form Container */}
                <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-white dark:bg-sidebar">
                    <div className="h-full overflow-y-auto">
                        <div className="min-h-full flex items-start justify-center p-6">
                            <div className="w-full max-w-6xl bg-white dark:bg-background rounded-xl border border-sidebar-border/70 shadow-lg">

                                <div className="border-b border-sidebar-border/70 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        New Rework Request
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Select a service delivery and specify what needs rework
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6">
                                    <div className="space-y-8">
                                        {/* Basic Information */}
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-3">
                                                Basic Information
                                            </h3>

                                            <div className="grid grid-cols-1 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Service Delivery Reference <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        required
                                                        value={formData.DELIVERY_ID}
                                                        onChange={(e) => handleDeliveryChange(e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                            errors.DELIVERY_ID ? 'border-red-500' : 'border-sidebar-border'
                                                        }`}
                                                    >
                                                        <option value="">Select a service delivery</option>
                                                        {availableDeliveries.map(delivery => (
                                                            <option key={delivery.ID} value={delivery.ID}>
                                                                {delivery.REFERENCE_NO} - {delivery.SUPPLIER_NAME} - {new Date(delivery.DELIVERY_DATE).toLocaleDateString()}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors.DELIVERY_ID && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.DELIVERY_ID}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Delivery Details Card */}
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
                                                        <div>
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">Request Date:</span>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {formData.CREATED_AT}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Services Selection */}
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    Services to Rework
                                                </h3>
                                                {formData.DELIVERY_ID && (
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        {availableServices.length} services available
                                                    </span>
                                                )}
                                            </div>

                                            {errors.services && (
                                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.services}</p>
                                                </div>
                                            )}

                                            {/* Available Services List */}
                                            {formData.DELIVERY_ID && (
                                                <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border p-4">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                                        Available Services from Delivery
                                                    </h4>
                                                    {isLoadingServices ? (
                                                        <div className="text-center py-4 text-sm text-gray-500 flex flex-col items-center">
                                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                                                            <span>Loading services...</span>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                                            {availableServices.length === 0 ? (
                                                                <p className="text-sm text-gray-500 italic">No services found in this delivery.</p>
                                                            ) : (
                                                                availableServices.map(service => (
                                                                    <div key={service.item_id} className="flex justify-between items-center p-3 bg-white dark:bg-sidebar rounded border border-sidebar-border hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                                                                        <div className="flex-1">
                                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{service.item_name}</p>
                                                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                                Rate: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(service.unit_price)}
                                                                            </p>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleAddService(service)}
                                                                            disabled={selectedServices.some(s => s.SERVICE_ID === service.item_id)}
                                                                            className="ml-4 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                                                        >
                                                                            {selectedServices.some(s => s.SERVICE_ID === service.item_id) ? 'Added' : 'Add'}
                                                                        </button>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Selected Services List */}
                                            {selectedServices.length > 0 && (
                                                <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border overflow-hidden">
                                                    <div className="bg-gray-50 dark:bg-sidebar-accent px-4 py-3 border-b border-sidebar-border">
                                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                                            Selected Services ({selectedServices.length})
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
                                                                            Total: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(service.UNIT_PRICE)}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveService(service.SERVICE_ID)}
                                                                    className="ml-4 p-2 text-red-600 hover:text-red-700 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>

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

                                        {/* Remarks Section */}
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
                                                    placeholder="Describe the service defects or reason for rework..."
                                                    rows={3}
                                                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
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
                                        <div className="flex gap-3 justify-between">
                                            <div className="flex gap-3">
                                                <div className="relative group">
                                                    <button
                                                        type="button"
                                                        onClick={handleReset}
                                                        className="w-12 h-12 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                <div className="relative group">
                                                    <button
                                                        type="button"
                                                        onClick={handleCancel}
                                                        className="w-12 h-12 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                className="flex-1 max-w-xs bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                            >
                                                Submit Rework Request
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
