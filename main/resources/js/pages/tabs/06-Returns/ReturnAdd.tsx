import AppLayout from '@/layouts/app-layout';
import { returns } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { getAvailableDeliveries, getDeliveryItems } from './utils';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Returns',
        href: returns().url,
    },
    {
        title: 'Return Slip',
        href: '/returns/add',
    },
];

export default function ReturnAdd({ auth }: { auth: any }) {
    const [formData, setFormData] = useState({
        DELIVERY_ID: '',
        REFERENCE_NO: '',
        RETURN_DATE: '',
        REMARKS: '',
        STATUS: 'pending'
    });
    const [selectedItems, setSelectedItems] = useState<Array<{
        ITEM_ID: number;
        ITEM_NAME: string;
        QUANTITY: number;
        UNIT_PRICE: number;
        MAX_QUANTITY: number;
    }>>([]);
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [deliveries, setDeliveries] = useState<any[]>([]);

    // Load deliveries on component mount
    useEffect(() => {
        loadDeliveries();
        generateReferenceNo();
    }, []);

    const loadDeliveries = () => {
        const availableDeliveries = getAvailableDeliveries();
        setDeliveries(availableDeliveries);
    };

    const generateReferenceNo = () => {
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000);
        const referenceNo = `RET-${timestamp}${random}`.slice(0, 15);
        setFormData(prev => ({ ...prev, REFERENCE_NO: referenceNo }));
    };

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};

        if (!formData.DELIVERY_ID) {
            newErrors.DELIVERY_ID = 'Delivery reference is required';
        }

        if (selectedItems.length === 0) {
            newErrors.items = 'At least one item must be selected for return';
        }

        if (!formData.RETURN_DATE) {
            newErrors.RETURN_DATE = 'Return date is required';
        }

        // Validate each selected item
        selectedItems.forEach((item, index) => {
            if (item.QUANTITY <= 0) {
                newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
            }
            if (item.QUANTITY > item.MAX_QUANTITY) {
                newErrors[`item_${index}_quantity`] = `Quantity cannot exceed ${item.MAX_QUANTITY}`;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleDeliveryChange = (deliveryId: string) => {
        setFormData(prev => ({ ...prev, DELIVERY_ID: deliveryId }));
        setSelectedItems([]); // Clear selected items when delivery changes

        if (errors.DELIVERY_ID) {
            setErrors(prev => ({ ...prev, DELIVERY_ID: '' }));
        }
    };

    const handleAddItem = (item: any) => {
        const existingItem = selectedItems.find(selected => selected.ITEM_ID === item.ITEM_ID);

        if (!existingItem) {
            setSelectedItems(prev => [...prev, {
                ITEM_ID: item.ITEM_ID,
                ITEM_NAME: item.ITEM_NAME,
                QUANTITY: 1,
                UNIT_PRICE: item.UNIT_PRICE,
                MAX_QUANTITY: item.AVAILABLE_QUANTITY
            }]);
        }
    };

    const handleRemoveItem = (itemId: number) => {
        setSelectedItems(prev => prev.filter(item => item.ITEM_ID !== itemId));
    };

    const handleItemQuantityChange = (itemId: number, quantity: number) => {
        setSelectedItems(prev => prev.map(item =>
            item.ITEM_ID === itemId ? { ...item, QUANTITY: quantity } : item
        ));
    };

    const getTotalValue = () => {
        return selectedItems.reduce((total, item) => total + (item.QUANTITY * item.UNIT_PRICE), 0);
    };

    const getSelectedDelivery = () => {
        return deliveries.find(d => d.ID.toString() === formData.DELIVERY_ID);
    };

    const getAvailableItems = () => {
        if (!formData.DELIVERY_ID) return [];
        const deliveryId = parseInt(formData.DELIVERY_ID);
        return getDeliveryItems(deliveryId);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            const selectedDelivery = getSelectedDelivery();

            // Prepare return data matching your returns.js structure
            const returnData = {
                CREATED_AT: new Date().toISOString().split('T')[0],
                RETURN_DATE: formData.RETURN_DATE,
                STATUS: formData.STATUS,
                REMARKS: formData.REMARKS,
                DELIVERY_ID: parseInt(formData.DELIVERY_ID),
                SUPPLIER_NAME: selectedDelivery?.SUPPLIER_NAME,
                ITEMS: selectedItems.map(item => ({
                    ITEM_ID: item.ITEM_ID,
                    QUANTITY: item.QUANTITY
                }))
            };

            console.log('New Return Data:', returnData);

            // In real application, you would send POST request to backend
            alert('Return created successfully!');

            // Redirect back to returns list
            router.visit(returns().url);
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
            DELIVERY_ID: '',
            REFERENCE_NO: '',
            RETURN_DATE: '',
            REMARKS: '',
            STATUS: 'pending'
        });
        setSelectedItems([]);
        setErrors({});
        generateReferenceNo();
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.visit(returns().url);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Return" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Return</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Create a new return for defective or incorrect items
                        </p>
                    </div>
                    <Link
                        href={returns().url}
                        className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                    >
                        Return Back
                    </Link>
                </div>

                {/* Form Container */}
                <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-[oklch(0.145_0_0)]">
                    <div className="h-full overflow-y-auto">
                        <div className="min-h-full flex items-start justify-center p-6">
                            <div className="w-full max-w-6xl bg-white dark:bg-background rounded-xl border border-sidebar-border/70 shadow-lg">
                                {/* Header Section */}
                                <div className="border-b border-sidebar-border/70 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        New Return Details
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Fill in the details below to create a new return
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
                                                        Reference Number
                                                    </label>
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={formData.REFERENCE_NO}
                                                        className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm bg-gray-50 dark:bg-input text-gray-900 dark:text-white font-mono cursor-not-allowed"
                                                    />
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        Auto-generated reference number
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Return Date <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        required
                                                        value={formData.RETURN_DATE}
                                                        onChange={(e) => handleInputChange('RETURN_DATE', e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                            errors.RETURN_DATE ? 'border-red-500' : 'border-sidebar-border'
                                                        }`}
                                                    />
                                                    {errors.RETURN_DATE && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.RETURN_DATE}</p>
                                                    )}
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
                                                        {deliveries.map(delivery => (
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

                                            {/* Selected Delivery Info */}
                                            {formData.DELIVERY_ID && (
                                                <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border p-4">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                        Delivery Information
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">Supplier:</span>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {getSelectedDelivery()?.SUPPLIER_NAME}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">Delivery Date:</span>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {getSelectedDelivery()?.DELIVERY_DATE ? new Date(getSelectedDelivery()!.DELIVERY_DATE).toLocaleDateString() : 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Items Selection */}
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    Items to Return
                                                </h3>
                                                {formData.DELIVERY_ID && (
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        {getAvailableItems().length} items available
                                                    </span>
                                                )}
                                            </div>

                                            {errors.items && (
                                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.items}</p>
                                                </div>
                                            )}

                                            {/* Available Items */}
                                            {formData.DELIVERY_ID && (
                                                <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border p-4">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                                        Available Items from Delivery
                                                    </h4>
                                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                                        {getAvailableItems().map(item => (
                                                            <div key={item.ID} className="flex justify-between items-center p-3 bg-white dark:bg-sidebar rounded border border-sidebar-border">
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.ITEM_NAME}</p>
                                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                        Available: {item.AVAILABLE_QUANTITY} • Price: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(item.UNIT_PRICE)}
                                                                    </p>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleAddItem(item)}
                                                                    disabled={selectedItems.some(selected => selected.ITEM_ID === item.ITEM_ID)}
                                                                    className="ml-4 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                                >
                                                                    Add
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Selected Items */}
                                            {selectedItems.length > 0 && (
                                                <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border overflow-hidden">
                                                    <div className="bg-gray-50 dark:bg-sidebar-accent px-4 py-3 border-b border-sidebar-border">
                                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                                            Selected Items ({selectedItems.length})
                                                        </h4>
                                                    </div>
                                                    <div className="divide-y divide-sidebar-border">
                                                        {selectedItems.map((item, index) => (
                                                            <div key={item.ITEM_ID} className="p-4">
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.ITEM_NAME}</p>
                                                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                            Unit Price: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(item.UNIT_PRICE)}
                                                                        </p>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveItem(item.ITEM_ID)}
                                                                        className="text-red-600 hover:text-red-700 p-1"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                    </button>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                            Quantity <span className="text-red-500">*</span>
                                                                        </label>
                                                                        <input
                                                                            type="number"
                                                                            min="1"
                                                                            max={item.MAX_QUANTITY}
                                                                            value={item.QUANTITY}
                                                                            onChange={(e) => handleItemQuantityChange(item.ITEM_ID, parseInt(e.target.value) || 0)}
                                                                            className={`w-full px-3 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                                                errors[`item_${index}_quantity`] ? 'border-red-500' : 'border-sidebar-border'
                                                                            }`}
                                                                        />
                                                                        {errors[`item_${index}_quantity`] && (
                                                                            <p className="text-red-500 text-xs mt-1">{errors[`item_${index}_quantity`]}</p>
                                                                        )}
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                            Max: {item.MAX_QUANTITY}
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                            Total Value
                                                                        </label>
                                                                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(item.QUANTITY * item.UNIT_PRICE)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Total Summary */}
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
                                                    Remarks
                                                </label>
                                                <textarea
                                                    value={formData.REMARKS}
                                                    onChange={(e) => handleInputChange('REMARKS', e.target.value)}
                                                    placeholder="Additional notes or comments about this return..."
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                />
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
                                                Create Return
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
