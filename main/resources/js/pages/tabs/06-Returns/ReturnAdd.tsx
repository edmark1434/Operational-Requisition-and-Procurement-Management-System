import AppLayout from '@/layouts/app-layout';
import { returnsIndex } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Returns', href: returnsIndex().url },
    { title: 'Create Return', href: '/returns/add' },
];

interface Props {
    auth: any;
    // Matches the data sent from ReturnsController::create
    availableDeliveriesList: Array<{
        id: number;
        reference_no: string;
        type: string;
        supplier_name: string;
        delivery_date: string;
    }>;
}

export default function ReturnAdd({ auth, availableDeliveriesList }: Props) {
    // Form State
    const [formData, setFormData] = useState({
        DELIVERY_ID: '',
        REFERENCE_NO: '',
        RETURN_DATE: new Date().toISOString().split('T')[0], // Defaults to today
        REMARKS: '',
        STATUS: 'pending'
    });
    const [availableDeliveries, setAvailableDeliveries] = useState(availableDeliveriesList);
    // Items selected by the user to return
    const [selectedItems, setSelectedItems] = useState<Array<{
        ITEM_ID: number;
        ITEM_NAME: string;
        QUANTITY: number;
        UNIT_PRICE: number;
        MAX_QUANTITY: number;
    }>>([]);

    // Items available from the API when a delivery is chosen
    const [availableItems, setAvailableItems] = useState<any[]>([]);
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [errors, setErrors] = useState<{[key: string]: string}>({});

    // Generate a visual "Draft" Reference Number
    // Note: The Backend generates the final official "REF-XXXXXX" upon saving.
    useEffect(() => {
        const filteredDeliveries = availableDeliveries.filter(d => d.type.includes('Item'));
        setAvailableDeliveries(filteredDeliveries);
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000);
        setFormData(prev => ({ ...prev, REFERENCE_NO: `DRAFT-${timestamp}`.slice(0, 15) }));
    }, []);

    // 1. Fetch Items when Delivery is selected
    const handleDeliveryChange = async (deliveryId: string) => {
        setFormData(prev => ({ ...prev, DELIVERY_ID: deliveryId }));

        // Reset items when changing delivery to prevent mixing items
        setSelectedItems([]);
        setAvailableItems([]);

        if (!deliveryId) return;

        setIsLoadingItems(true);
        try {
            const response = await axios.get(`/api/delivery/${deliveryId}/items`);
            if (Array.isArray(response.data)) {
                setAvailableItems(response.data);
            }
        } catch (error) {
            console.error("Failed to load delivery items", error);
            alert("Could not load items for this delivery.");
        } finally {
            setIsLoadingItems(false);
        }
    };

    // 2. Add Item to Selection
    const handleAddItem = (item: any) => {
        const existingItem = selectedItems.find(selected => selected.ITEM_ID === item.item_id);

        if (!existingItem) {
            setSelectedItems(prev => [...prev, {
                ITEM_ID: item.item_id,
                ITEM_NAME: item.item_name,
                QUANTITY: 1, // Default quantity
                UNIT_PRICE: Number(item.unit_price),
                MAX_QUANTITY: Number(item.available_quantity)
            }]);
        }
    };

    // 3. Remove Item from Selection
    const handleRemoveItem = (itemId: number) => {
        setSelectedItems(prev => prev.filter(item => item.ITEM_ID !== itemId));
    };

    // 4. Handle Quantity Change
    const handleItemQuantityChange = (itemId: number, quantity: number) => {
        setSelectedItems(prev => prev.map(item =>
            item.ITEM_ID === itemId ? { ...item, QUANTITY: quantity } : item
        ));
    };

    // Helper: Calculate Total Value
    const getTotalValue = () => {
        return selectedItems.reduce((total, item) => total + (item.QUANTITY * item.UNIT_PRICE), 0);
    };

    // Helper: Get details of currently selected delivery
    const getSelectedDelivery = () => {
        return availableDeliveries.find(d => d.id.toString() === formData.DELIVERY_ID);
    };

    // 5. Validation Logic
    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};
        if (!formData.DELIVERY_ID) newErrors.DELIVERY_ID = 'Delivery reference is required';
        if (selectedItems.length === 0) newErrors.items = 'At least one item must be selected';

        selectedItems.forEach((item, index) => {
            if (item.QUANTITY <= 0) newErrors[`item_${index}_quantity`] = 'Invalid quantity';
            if (item.QUANTITY > item.MAX_QUANTITY) newErrors[`item_${index}_quantity`] = `Max: ${item.MAX_QUANTITY}`;
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 6. Submit Data to Backend
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // ADD THIS LOGGING
        console.log("Submitting form...", formData, selectedItems);

        if (!validateForm()) {
            console.log("Validation failed", errors); // See what is missing in console
            alert("Please check the form for errors (e.g., select a delivery or add items).");
            return;
        }

        const payload = {
            delivery_id: formData.DELIVERY_ID,
            return_date: formData.RETURN_DATE,
            remarks: formData.REMARKS,
            items: selectedItems.map(item => ({
                item_id: item.ITEM_ID,
                quantity: item.QUANTITY
            }))
        };

        router.post('/returns', payload, {
            onSuccess: () => alert('Success!'), // simple feedback
            onError: (err: any) => {
                console.error("Server Error:", err);
                setErrors(err);
                alert("Server rejected the request. Check console.");
            }
        });
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleCancel = () => {
        if (selectedItems.length > 0 && !window.confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
            return;
        }
        router.visit(returnsIndex().url);
    };

    const handleReset = () => {
        if (selectedItems.length > 0 && !window.confirm('Reset form? All selections will be cleared.')) {
            return;
        }

        setFormData(prev => ({
            ...prev,
            DELIVERY_ID: '',
            REMARKS: '',
            RETURN_DATE: new Date().toISOString().split('T')[0],
            STATUS: 'pending'
        }));
        setSelectedItems([]);
        setAvailableItems([]);
        setErrors({});
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Return" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Top Bar */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Return</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Create a new return for defective or incorrect items
                        </p>
                    </div>
                    <Link
                        href={returnsIndex().url}
                        className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                    >
                        Return to Returns
                    </Link>
                </div>

                {/* Main Form Container */}
                <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-white dark:bg-sidebar">
                    <div className="h-full overflow-y-auto">
                        <div className="min-h-full flex items-start justify-center p-6">
                            <div className="w-full max-w-6xl bg-white dark:bg-background rounded-xl border border-sidebar-border/70 shadow-lg">

                                {/* Form Header */}
                                <div className="border-b border-sidebar-border/70 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        New Return Slip
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Fill in the details below to create a return
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6">
                                    <div className="space-y-8">

                                        {/* Basic Information Section */}
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-3">
                                                Basic Information
                                            </h3>

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
                                                            <option key={delivery.id} value={delivery.id}>
                                                                {delivery.reference_no} - {delivery.supplier_name} - {new Date(delivery.delivery_date).toLocaleDateString()}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors.DELIVERY_ID && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.DELIVERY_ID}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Delivery Information Card (Conditionally Rendered) */}
                                            {formData.DELIVERY_ID && (
                                                <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border p-4">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                        Delivery Information
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">Supplier:</span>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {getSelectedDelivery()?.supplier_name}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">Delivery Date:</span>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {getSelectedDelivery()?.delivery_date ? new Date(getSelectedDelivery()!.delivery_date).toLocaleDateString() : 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Items Selection Section */}
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    Items to Return
                                                </h3>
                                                {formData.DELIVERY_ID && (
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        {availableItems.length} items available
                                                    </span>
                                                )}
                                            </div>

                                            {errors.items && (
                                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.items}</p>
                                                </div>
                                            )}

                                            {/* Available Items List (Conditionally Rendered) */}
                                            {formData.DELIVERY_ID && (
                                                <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border p-4">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                                        Available Items from Delivery
                                                    </h4>
                                                    {isLoadingItems ? (
                                                        <div className="text-center py-4 text-sm text-gray-500">Loading items...</div>
                                                    ) : (
                                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                                            {availableItems.length === 0 ? (
                                                                <p className="text-sm text-gray-500 italic">No items found.</p>
                                                            ) : (
                                                                availableItems.map(item => (
                                                                    <div key={item.item_id} className="flex justify-between items-center p-3 bg-white dark:bg-sidebar rounded border border-sidebar-border">
                                                                        <div className="flex-1">
                                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{item.item_name}</p>
                                                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                                Available: {item.available_quantity} • Price: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(item.unit_price)}
                                                                            </p>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleAddItem(item)}
                                                                            disabled={selectedItems.some(selected => selected.ITEM_ID === item.item_id)}
                                                                            className="ml-4 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                                        >
                                                                            Add
                                                                        </button>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Selected Items Card (Conditionally Rendered) */}
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

                                                    {/* Total Summary Footer */}
                                                    <div className="bg-gray-50 dark:bg-sidebar-accent px-4 py-3 border-t border-sidebar-border">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm font-medium text-gray-900 dark:text-white">Total Return Value:</span>
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

                                    {/* Action Buttons (Sticky Footer) */}
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

                                            {/* Submit Button */}
                                            <button
                                                type="submit"
                                                className="flex-1 max-w-xs bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                            >
                                                Submit Return
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
