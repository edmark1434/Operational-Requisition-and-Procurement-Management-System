import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';

interface ReturnEditProps {
    auth: any;
    returnId: number;
    serverReturnData: any;
    serverDeliveryItems: any[];
    serverDeliveries: any[];
}

const breadcrumbs = (returnId: number): BreadcrumbItem[] => [
    {
        title: 'Returns',
        href: '/returns',
    },
    {
        title: `Edit Return #${returnId}`,
        href: `/returns/${returnId}/edit`,
    },
];

export default function ReturnEdit({
                                       auth,
                                       returnId,
                                       serverReturnData,
                                       serverDeliveryItems,
                                       serverDeliveries
                                   }: ReturnEditProps) {

    // 1. Initialize State DIRECTLY (Fixed for nested Delivery ID)
    const [formData, setFormData] = useState(() => {
        // LOGIC FIX: Check for direct ID, otherwise check the 'deliveries' array
        let initialDeliveryId = '';

        if (serverReturnData?.delivery_id) {
            initialDeliveryId = String(serverReturnData.delivery_id);
        } else if (serverReturnData?.deliveries && serverReturnData.deliveries.length > 0) {
            // Extracts ID from the relation: [{"id":1, ...}]
            initialDeliveryId = String(serverReturnData.deliveries[0].id);
        }

        console.log("Resolved Delivery ID:", initialDeliveryId); // Debug Log

        return {
            DELIVERY_ID: initialDeliveryId,
            REFERENCE_NO: serverReturnData?.ref_no || '',
            RETURN_DATE: serverReturnData?.created_at ? serverReturnData.created_at.split('T')[0] : '',
            REMARKS: serverReturnData?.remarks || '',
            STATUS: serverReturnData?.status || 'Pending'
        };
    });

    const [selectedItems, setSelectedItems] = useState<Array<{
        ITEM_ID: number;
        ITEM_NAME: string;
        QUANTITY: number;
        UNIT_PRICE: number;
        MAX_QUANTITY: number;
    }>>([]);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const deliveries = Array.isArray(serverDeliveries) ? serverDeliveries : [];

    // 2. Initialize Items
    useEffect(() => {
        if (serverReturnData?.items && Array.isArray(serverDeliveryItems)) {
            const mappedItems = serverReturnData.items.map((savedItem: any) => {
                const deliveryItem = serverDeliveryItems.find((d: any) => d.item_id == savedItem.item_id);

                const currentHeldQty = Number(savedItem.quantity);
                const availableInDelivery = deliveryItem ? Number(deliveryItem.available_quantity) : 0;
                const totalMax = Math.max(currentHeldQty, availableInDelivery + currentHeldQty);

                return {
                    ITEM_ID: savedItem.item_id,
                    ITEM_NAME: savedItem.item ? (savedItem.item.item_name || savedItem.item.name) : 'Unknown Item',
                    QUANTITY: currentHeldQty,
                    UNIT_PRICE: deliveryItem ? Number(deliveryItem.unit_price) : 0,
                    MAX_QUANTITY: totalMax
                };
            });
            setSelectedItems(mappedItems);
        }
    }, [serverReturnData, serverDeliveryItems]);

    // --- Validation ---
    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};

        if (!formData.DELIVERY_ID) newErrors.DELIVERY_ID = 'Delivery reference is required';
        if (selectedItems.length === 0) newErrors.items = 'At least one item must be selected for return';

        selectedItems.forEach((item, index) => {
            if (item.QUANTITY <= 0) {
                newErrors[`item_${index}_quantity`] = `${item.ITEM_NAME}: Quantity must be > 0`;
            }
            if (item.QUANTITY > item.MAX_QUANTITY) {
                newErrors[`item_${index}_quantity`] = `${item.ITEM_NAME}: Cannot exceed max (${item.MAX_QUANTITY})`;
            }
        });

        setErrors(newErrors);
        return newErrors;
    };

    // --- Submit ---
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const currentErrors = validateForm();

        if (Object.keys(currentErrors).length === 0) {
            setIsSubmitting(true);
            const payload = {
                remarks: formData.REMARKS,
                items: selectedItems.map(item => ({
                    item_id: item.ITEM_ID,
                    quantity: item.QUANTITY
                }))
            };

            router.put(`/returns/${returnId}`, payload, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Return updated successfully!');
                    setIsSubmitting(false);
                },
                onError: (err) => {
                    console.error("Server Error:", err);
                    setIsSubmitting(false);
                    toast.error('Failed to update return.');
                }
            });
        } else {
            const firstErrorMessage = Object.values(currentErrors)[0];
            toast.error(`Validation Failed: ${firstErrorMessage}`);
        }
    };

    // --- Helpers ---
    const handleAddItem = (item: any) => {
        const existingItem = selectedItems.find(selected => selected.ITEM_ID == item.item_id);
        if (!existingItem) {
            setSelectedItems(prev => [...prev, {
                ITEM_ID: item.item_id,
                ITEM_NAME: item.item_name,
                QUANTITY: 1,
                UNIT_PRICE: item.unit_price,
                MAX_QUANTITY: item.available_quantity
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
        return deliveries.find(d => d.ID.toString() == formData.DELIVERY_ID);
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleDelete = () => {
        router.delete(`/returns/${returnId}`, {
            onSuccess: () => {
                toast.success('Return deleted successfully!');
                setShowDeleteConfirm(false);
            },
            onError: () => {
                toast.error('Failed to delete return.');
                setShowDeleteConfirm(false);
            }
        });
    };

    const handleCancel = () => {
        if (window.confirm('Discard unsaved changes?')) {
            router.visit('/returns');
        }
    };

    // Safe check for data availability
    if (!serverReturnData) {
        return (
            <AppLayout breadcrumbs={breadcrumbs(returnId)}>
                <div className="p-8 text-center">
                    <h2 className="text-xl font-bold text-red-600">Error: Return Data Not Found</h2>
                    <Link href="/returns" className="mt-4 inline-block text-blue-600 underline">Back to List</Link>
                </div>
            </AppLayout>
        );
    }

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs(returnId)}>
                <Head title="Edit Return" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Return</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Editing Return #{formData.REFERENCE_NO}
                            </p>
                        </div>
                        <Link
                            href="/returns"
                            className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-gray-700"
                        >
                            Return to Returns
                        </Link>
                    </div>

                    {/* Form Container */}
                    <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-white dark:bg-sidebar">
                        <div className="h-full overflow-y-auto">
                            <div className="min-h-full flex items-start justify-center p-6">
                                <div className="w-full max-w-6xl bg-white dark:bg-background rounded-xl border border-sidebar-border/70 shadow-lg">
                                    <div className="border-b border-sidebar-border/70 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            Edit Return #{formData.REFERENCE_NO}
                                        </h2>
                                        <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold
                                            ${formData.STATUS === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                            formData.STATUS === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {formData.STATUS}
                                        </div>
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
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Status
                                                        </label>
                                                        <input
                                                            type="text"
                                                            readOnly
                                                            value={formData.STATUS}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm bg-gray-50 dark:bg-input text-gray-900 dark:text-white font-medium cursor-not-allowed"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Delivery Reference
                                                        </label>
                                                        <select
                                                            disabled
                                                            value={formData.DELIVERY_ID}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm bg-gray-100 dark:bg-sidebar-accent text-gray-600 dark:text-gray-400 cursor-not-allowed"
                                                        >
                                                            {!formData.DELIVERY_ID && <option value="">Loading Delivery Info...</option>}
                                                            {deliveries.map(delivery => (
                                                                <option key={delivery.ID} value={delivery.ID}>
                                                                    {delivery.REFERENCE_NO} - {delivery.SUPPLIER_NAME} - {new Date(delivery.DELIVERY_DATE).toLocaleDateString()}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            To change delivery, delete this return and create a new one.
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Selected Delivery Info */}
                                                {formData.DELIVERY_ID && getSelectedDelivery() && (
                                                    <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border p-4">
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

                                                {!formData.DELIVERY_ID && (
                                                    <div className="p-3 bg-red-100 text-red-800 text-xs rounded border border-red-200">
                                                        <strong>System Error:</strong> Could not find Delivery ID in the return data.
                                                    </div>
                                                )}
                                            </div>

                                            {/* Items Selection */}
                                            <div className="space-y-6">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        Items to Return
                                                    </h3>
                                                </div>

                                                {errors.items && (
                                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                                        <p className="text-sm text-red-600 dark:text-red-400">{errors.items}</p>
                                                    </div>
                                                )}

                                                {/* Available Items */}
                                                <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border p-4">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                                        Available Items from Delivery
                                                    </h4>
                                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                                        {serverDeliveryItems.map((item: any) => (
                                                            <div key={item.item_id} className="flex justify-between items-center p-3 bg-white dark:bg-sidebar rounded border border-sidebar-border">
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.item_name}</p>
                                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                        Available to add: {item.available_quantity} • Price: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(item.unit_price)}
                                                                    </p>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleAddItem(item)}
                                                                    disabled={selectedItems.some(selected => selected.ITEM_ID == item.item_id) || item.available_quantity <= 0}
                                                                    className="ml-4 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                                >
                                                                    {selectedItems.some(selected => selected.ITEM_ID == item.item_id) ? 'Added' : 'Add'}
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

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
                                            <div className="flex justify-between items-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowDeleteConfirm(true)}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100"
                                                >
                                                    Delete Return
                                                </button>
                                                <div className="flex gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={handleCancel}
                                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {isSubmitting ? 'Saving...' : 'Save Changes'}
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

            <Toaster />

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-sidebar rounded-xl max-w-md w-full border border-sidebar-border">
                        <div className="p-6 border-b border-sidebar-border">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Delete Return
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Are you sure you want to delete return "{formData.REFERENCE_NO}"? This action cannot be undone.
                            </p>
                        </div>
                        <div className="p-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                            >
                                Delete Return
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
