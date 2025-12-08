import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reworks', href: '/reworks' },
    { title: 'Create Rework', href: '/reworks/add' },
];

interface Props {
    auth: any;
    deliveries: any[];
}

// Helper to determine badge color based on status text
const getStatusBadgeStyle = (status: string) => {
    const s = status ? status.toLowerCase() : '';
    if (s.includes('pending')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    if (s.includes('issued') || s.includes('approved')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    if (s.includes('delivered') || s.includes('resolved') || s.includes('completed')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (s.includes('rejected') || s.includes('cancelled')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

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

    // Services selected for current rework
    const [selectedServices, setSelectedServices] = useState<Array<{
        SERVICE_ID: number;
        SERVICE_NAME: string;
        QUANTITY: number;
        UNIT_PRICE: number;
    }>>([]);

    // Data States
    const [availableDeliveries, setAvailableDeliveries] = useState<any[]>(deliveries);
    const [availableServices, setAvailableServices] = useState<any[]>([]);
    const [isLoadingServices, setIsLoadingServices] = useState(false);
    const [hasCheckedServices, setHasCheckedServices] = useState(false);
    const [errors, setErrors] = useState<{[key: string]: string}>({});

    useEffect(() => {
        // Filter deliveries to only show those capable of services
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
        setHasCheckedServices(false);

        if (errors.DELIVERY_ID) setErrors(prev => ({ ...prev, DELIVERY_ID: '' }));

        if (!deliveryId) return;

        setIsLoadingServices(true);

        try {
            const response = await axios.get(`/api/reworks/delivery/${deliveryId}/services`);
            if (Array.isArray(response.data)) {
                setAvailableServices(response.data);
            }
        } catch (error) {
            console.error("Failed to load delivery services", error);
        } finally {
            setIsLoadingServices(false);
            setHasCheckedServices(true);
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

    // 3. Remove Service (FIXED LOGIC)
    const handleRemoveService = (serviceId: number | string) => {
        // Using String() ensures we compare "5" vs 5 correctly so the delete always works
        setSelectedServices(prev => prev.filter(s => String(s.SERVICE_ID) !== String(serviceId)));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            const payload = {
                delivery_id: formData.DELIVERY_ID,
                reference_no: formData.REFERENCE_NO,
                remarks: formData.REMARKS,
                services: selectedServices.map(s => ({
                    service_id: s.SERVICE_ID,
                    quantity: s.QUANTITY
                }))
            };

            router.post('/reworks', payload, {
                onSuccess: () => {
                    // Success logic handled by Inertia redirect usually
                },
                onError: (err) => {
                    console.error(err);
                }
            });
        }
    };

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
        setHasCheckedServices(false);
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

                <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-white dark:bg-sidebar">
                    <div className="h-full overflow-y-auto">
                        <div className="min-h-full flex items-start justify-center p-6">
                            <div className="w-full max-w-6xl bg-white dark:bg-background rounded-xl border border-sidebar-border/70 shadow-lg">

                                <div className="border-b border-sidebar-border/70 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        New Rework Request
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Select a service delivery. Services already in process will show their status.
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
                                        </div>

                                        {/* Services Selection */}
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    Services to Rework
                                                </h3>
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
                                                        <div className="text-center py-8 text-sm text-gray-500 flex flex-col items-center">
                                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                                                            <span>Checking available services...</span>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                                            {availableServices.length === 0 ? (
                                                                <div className="text-center py-6">
                                                                    {hasCheckedServices ? (
                                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                            No services found for this delivery.
                                                                        </p>
                                                                    ) : (
                                                                        <p className="text-sm text-gray-500">Waiting for selection...</p>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                availableServices.map(service => {
                                                                    // Check if added to current selection
                                                                    const isSelected = selectedServices.some(s => s.SERVICE_ID === service.item_id);

                                                                    // Check if blocked by backend and get Status
                                                                    const currentStatus = service.rework_status;
                                                                    const isUnavailable = !!currentStatus;

                                                                    return (
                                                                        <div key={service.item_id} className={`flex justify-between items-center p-3 rounded border transition-colors ${
                                                                            isUnavailable
                                                                                ? 'bg-gray-100 dark:bg-sidebar-accent border-gray-200 dark:border-gray-700 opacity-75'
                                                                                : 'bg-white dark:bg-sidebar border-sidebar-border hover:border-blue-300 dark:hover:border-blue-700'
                                                                        }`}>
                                                                            <div className="flex-1">
                                                                                <div className="flex items-center gap-2">
                                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                                        {service.item_name}
                                                                                    </p>
                                                                                    {/* STATUS BADGE */}
                                                                                    {isUnavailable && (
                                                                                        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full ${getStatusBadgeStyle(currentStatus)}`}>
                                                                                            {currentStatus}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                                    Rate: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(service.unit_price)}
                                                                                </p>
                                                                            </div>

                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleAddService(service)}
                                                                                disabled={isSelected || isUnavailable}
                                                                                className={`ml-4 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                                                                                    isUnavailable
                                                                                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                                                                        : isSelected
                                                                                            ? 'bg-blue-600 text-white opacity-50 cursor-not-allowed'
                                                                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                                                                }`}
                                                                            >
                                                                                {isUnavailable ? 'Locked' : (isSelected ? 'Added' : 'Add')}
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                })
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
                                                        {selectedServices.map((service) => (
                                                            <div key={service.SERVICE_ID} className="p-4 flex justify-between items-center group">
                                                                <div className="flex-1">
                                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                                        {service.SERVICE_NAME}
                                                                    </p>
                                                                    <div className="flex gap-4 mt-1">
                                                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                            Rate: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(service.UNIT_PRICE)}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* DELETE BUTTON */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveService(service.SERVICE_ID)}
                                                                    className="ml-4 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                                                                    title="Remove service"
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
                                                <button
                                                    type="button"
                                                    onClick={handleReset}
                                                    className="w-12 h-12 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                                                    title="Reset Form"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleCancel}
                                                    className="w-12 h-12 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                                                    title="Cancel and Go Back"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={selectedServices.length === 0}
                                                className={`flex-1 max-w-xs py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out ${
                                                    selectedServices.length === 0
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                }`}
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
