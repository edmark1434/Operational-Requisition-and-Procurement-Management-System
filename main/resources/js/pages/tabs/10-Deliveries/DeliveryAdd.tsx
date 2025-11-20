import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { getAvailablePurchaseOrders, getPurchaseOrderItems, formatCurrency, formatDate } from './utils';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Deliveries',
        href: '/deliveries',
    },
    {
        title: 'Add Delivery',
        href: '/deliveries/add',
    },
];

export default function DeliveryAdd({ auth }: { auth: any }) {
    const [formData, setFormData] = useState({
        PO_ID: '',
        RECEIPT_NO: '',
        DELIVERY_DATE: '',
        REMARKS: '',
        STATUS: 'pending',
        RECEIPT_PHOTO: ''
    });
    const [selectedItems, setSelectedItems] = useState<Array<{
        ITEM_ID: number;
        ITEM_NAME: string;
        QUANTITY: number;
        UNIT_PRICE: number;
        BARCODE: string;
        MAX_QUANTITY: number;
    }>>([]);
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);

    // Auto-calculate total cost whenever selected items change
    useEffect(() => {
        // This effect will automatically update the total cost display
        // The total is now calculated on-demand in calculateTotalCost()
    }, [selectedItems]);

    // Load data on component mount
    useEffect(() => {
        loadPurchaseOrders();
    }, []);

    const loadPurchaseOrders = () => {
        const availablePOs = getAvailablePurchaseOrders();
        setPurchaseOrders(availablePOs);
    };

    const handleReceiptPhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setFormData(prev => ({ ...prev, RECEIPT_PHOTO: e.target?.result as string }));
                // Clear receipt photo error if any
                if (errors.RECEIPT_PHOTO) {
                    setErrors(prev => ({ ...prev, RECEIPT_PHOTO: '' }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Calculate total cost from selected items
    const calculateTotalCost = () => {
        return selectedItems.reduce((total, item) => total + (item.QUANTITY * item.UNIT_PRICE), 0);
    };

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};

        if (!formData.PO_ID) {
            newErrors.PO_ID = 'Purchase order is required';
        }

        if (!formData.RECEIPT_NO) {
            newErrors.RECEIPT_NO = 'Receipt number is required';
        }

        if (selectedItems.length === 0) {
            newErrors.items = 'At least one item must be selected for delivery';
        }

        if (!formData.DELIVERY_DATE) {
            newErrors.DELIVERY_DATE = 'Delivery date is required';
        }

        // Add receipt photo validation
        if (!formData.RECEIPT_PHOTO) {
            newErrors.RECEIPT_PHOTO = 'Receipt photo is required';
        }

        selectedItems.forEach((item, index) => {
            if (item.QUANTITY <= 0) {
                newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
            }
            // Removed the max quantity validation to allow more than ordered quantity
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePurchaseOrderChange = (poId: string) => {
        setFormData(prev => ({ ...prev, PO_ID: poId }));
        setSelectedItems([]);

        if (errors.PO_ID) {
            setErrors(prev => ({ ...prev, PO_ID: '' }));
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
                BARCODE: item.BARCODE,
                MAX_QUANTITY: item.QUANTITY_ORDERED
            }]);
        }
    };

    const handleRemoveItem = (itemId: number) => {
        setSelectedItems(prev => prev.filter(item => item.ITEM_ID !== itemId));
    };

    const handleItemQuantityChange = (itemId: number, quantity: number) => {
        // Allow any positive quantity (removed max limit)
        setSelectedItems(prev => prev.map(item =>
            item.ITEM_ID === itemId ? {
                ...item,
                QUANTITY: Math.max(1, quantity) // Ensure at least 1
            } : item
        ));
    };

    const getTotalValue = () => {
        return calculateTotalCost();
    };

    const getSelectedPurchaseOrder = () => {
        return purchaseOrders.find(po => po.ID.toString() === formData.PO_ID);
    };

    const getAvailableItems = () => {
        if (!formData.PO_ID) return [];
        const poId = parseInt(formData.PO_ID);
        return getPurchaseOrderItems(poId);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            const selectedPO = getSelectedPurchaseOrder();
            const calculatedTotalCost = calculateTotalCost();

            const deliveryData = {
                DELIVERY_DATE: formData.DELIVERY_DATE,
                TOTAL_COST: calculatedTotalCost,
                RECEIPT_NO: formData.RECEIPT_NO,
                RECEIPT_PHOTO: formData.RECEIPT_PHOTO,
                STATUS: formData.STATUS,
                REMARKS: formData.REMARKS,
                PO_ID: parseInt(formData.PO_ID),
                ITEMS: selectedItems.map(item => ({
                    ITEM_ID: item.ITEM_ID,
                    QUANTITY: item.QUANTITY,
                    UNIT_PRICE: item.UNIT_PRICE
                }))
            };

            console.log('New Delivery Data:', deliveryData);
            alert('Delivery created successfully!');
            router.visit('/deliveries');
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
            PO_ID: '',
            RECEIPT_NO: '',
            DELIVERY_DATE: '',
            REMARKS: '',
            STATUS: 'pending',
            RECEIPT_PHOTO: ''
        });
        setSelectedItems([]);
        setErrors({});
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.visit('/deliveries');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Delivery" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Delivery</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Create a new delivery record linked to a purchase order
                        </p>
                    </div>
                    <Link
                        href="/deliveries"
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
                                        New Delivery Details
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Fill in the details below to create a new delivery linked to a purchase order
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
                                                        Receipt Number <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.RECEIPT_NO}
                                                        onChange={(e) => handleInputChange('RECEIPT_NO', e.target.value)}
                                                        placeholder="Enter receipt number"
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                            errors.RECEIPT_NO ? 'border-red-500' : 'border-sidebar-border'
                                                        }`}
                                                    />
                                                    {errors.RECEIPT_NO && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.RECEIPT_NO}</p>
                                                    )}
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        Enter the receipt number from your delivery
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Delivery Date <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        required
                                                        value={formData.DELIVERY_DATE}
                                                        onChange={(e) => handleInputChange('DELIVERY_DATE', e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                            errors.DELIVERY_DATE ? 'border-red-500' : 'border-sidebar-border'
                                                        }`}
                                                    />
                                                    {errors.DELIVERY_DATE && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.DELIVERY_DATE}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Purchase Order <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        required
                                                        value={formData.PO_ID}
                                                        onChange={(e) => handlePurchaseOrderChange(e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                            errors.PO_ID ? 'border-red-500' : 'border-sidebar-border'
                                                        }`}
                                                    >
                                                        <option value="">Select a purchase order</option>
                                                        {purchaseOrders.map(po => (
                                                            <option key={po.ID} value={po.ID}>
                                                                {po.REFERENCE_NO} - {po.SUPPLIER_NAME} - {formatCurrency(po.TOTAL_COST)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors.PO_ID && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.PO_ID}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Total Cost
                                                    </label>
                                                    <div className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm bg-gray-50 dark:bg-input text-gray-900 dark:text-white font-mono">
                                                        {formatCurrency(calculateTotalCost())}
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        Automatically calculated from selected items
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Receipt Photo <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        required
                                                        onChange={handleReceiptPhotoUpload}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                            errors.RECEIPT_PHOTO ? 'border-red-500' : 'border-sidebar-border'
                                                        }`}
                                                    />
                                                    {errors.RECEIPT_PHOTO && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.RECEIPT_PHOTO}</p>
                                                    )}
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        Upload a photo of the delivery receipt (required)
                                                    </p>
                                                    {formData.RECEIPT_PHOTO && (
                                                        <div className="mt-2">
                                                            <img
                                                                src={formData.RECEIPT_PHOTO}
                                                                alt="Receipt preview"
                                                                className="h-20 w-auto rounded border"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Status
                                                    </label>
                                                    <select
                                                        value={formData.STATUS}
                                                        onChange={(e) => handleInputChange('STATUS', e.target.value)}
                                                        className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="in-transit">In Transit</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Selected Purchase Order Info */}
                                            {formData.PO_ID && (
                                                <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border p-4">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                        Purchase Order Information
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">Supplier:</span>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {getSelectedPurchaseOrder()?.SUPPLIER_NAME}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">Order Date:</span>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {getSelectedPurchaseOrder()?.CREATED_AT ? formatDate(getSelectedPurchaseOrder()!.CREATED_AT) : 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">Payment Type:</span>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {getSelectedPurchaseOrder()?.PAYMENT_TYPE}
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
                                                    Delivery Items
                                                </h3>
                                                {formData.PO_ID && (
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        {getAvailableItems().length} items available from PO
                                                    </span>
                                                )}
                                            </div>

                                            {errors.items && (
                                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.items}</p>
                                                </div>
                                            )}

                                            {/* Available Items from Purchase Order */}
                                            {formData.PO_ID && (
                                                <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border p-4">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                                        Available Items from Purchase Order
                                                    </h4>
                                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                                        {getAvailableItems().map(item => (
                                                            <div key={item.ITEM_ID} className="flex justify-between items-center p-3 bg-white dark:bg-sidebar rounded border border-sidebar-border">
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.ITEM_NAME}</p>
                                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                        Ordered: {item.QUANTITY_ORDERED} • Price: {formatCurrency(item.UNIT_PRICE)}
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
                                                                            Unit Price: {formatCurrency(item.UNIT_PRICE)}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                                            Barcode: {item.BARCODE}
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
                                                                            Ordered: {item.MAX_QUANTITY} (reference only)
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                            Total Value
                                                                        </label>
                                                                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                                            {formatCurrency(item.QUANTITY * item.UNIT_PRICE)}
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
                                                                {formatCurrency(getTotalValue())}
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
                                                    placeholder="Additional notes or comments about this delivery..."
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="sticky bottom-0 bg-white dark:bg-background pt-6 pb-2 border-t border-sidebar-border/70 -mx-6 px-6 mt-8">
                                        <div className="flex gap-3 justify-between items-center">
                                            <div className="flex gap-3">
                                                {/* Reset Button - Circle with refresh icon and tooltip */}
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

                                                {/* Cancel Button - Circle with X icon and tooltip */}
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

                                            <button
                                                type="submit"
                                                className="flex-1 max-w-xs bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                            >
                                                Create Delivery
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
