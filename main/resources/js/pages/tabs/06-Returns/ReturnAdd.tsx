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
    availableDeliveriesList: Array<{
        id: number;
        reference_no: string;
        type: string;
        supplier_name: string;
        delivery_date: string;
    }>;
}

export default function ReturnAdd({ auth, availableDeliveriesList }: Props) {
    const [formData, setFormData] = useState({
        DELIVERY_ID: '',
        REFERENCE_NO: '',
        RETURN_DATE: new Date().toISOString().split('T')[0],
        REMARKS: '',
        STATUS: 'pending'
    });
    const [availableDeliveries, setAvailableDeliveries] = useState(availableDeliveriesList);

    // Items user wants to return
    const [selectedItems, setSelectedItems] = useState<Array<{
        ITEM_ID: number;
        ITEM_NAME: string;
        QUANTITY: number;
        UNIT_PRICE: number;
        MAX_QUANTITY: number;
    }>>([]);

    // Items from API
    const [availableItems, setAvailableItems] = useState<any[]>([]);
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [errors, setErrors] = useState<{[key: string]: string}>({});

    useEffect(() => {
        const filteredDeliveries = availableDeliveries.filter(d => d.type.includes('Item'));
        setAvailableDeliveries(filteredDeliveries);
        const timestamp = new Date().getTime();
        setFormData(prev => ({ ...prev, REFERENCE_NO: `DRAFT-${timestamp}`.slice(0, 15) }));
    }, []);

    const handleDeliveryChange = async (deliveryId: string) => {
        setFormData(prev => ({ ...prev, DELIVERY_ID: deliveryId }));
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

    const handleAddItem = (item: any) => {
        const existingItem = selectedItems.find(selected => selected.ITEM_ID === item.item_id);

        if (!existingItem) {
            setSelectedItems(prev => [...prev, {
                ITEM_ID: item.item_id,
                ITEM_NAME: item.item_name,
                QUANTITY: 1,
                UNIT_PRICE: Number(item.unit_price),
                MAX_QUANTITY: Number(item.available_quantity)
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
        return availableDeliveries.find(d => d.id.toString() === formData.DELIVERY_ID);
    };

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};
        if (!formData.DELIVERY_ID) newErrors.DELIVERY_ID = 'Delivery reference is required';
        if (selectedItems.length === 0) newErrors.items = 'At least one item must be selected';

        selectedItems.forEach((item, index) => {
            if (item.QUANTITY <= 0) newErrors[`item_${index}_quantity`] = 'Invalid quantity';
            if (item.QUANTITY > item.MAX_QUANTITY) newErrors[`item_${index}_quantity`] = `Max available: ${item.MAX_QUANTITY}`;
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            alert("Please check the form for errors.");
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
            onSuccess: () => alert('Success!'),
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
        if (selectedItems.length > 0 && !window.confirm('Discard changes?')) return;
        router.visit(returnsIndex().url);
    };

    const handleReset = () => {
        if (selectedItems.length > 0 && !window.confirm('Reset form?')) return;
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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Return</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Create a new return for defective or incorrect items
                        </p>
                    </div>
                    <Link
                        href={returnsIndex().url}
                        className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-gray-700"
                    >
                        Return to Returns
                    </Link>
                </div>

                <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-white dark:bg-sidebar">
                    <div className="h-full overflow-y-auto">
                        <div className="min-h-full flex items-start justify-center p-6">
                            <div className="w-full max-w-6xl bg-white dark:bg-background rounded-xl border border-sidebar-border/70 shadow-lg">

                                <div className="border-b border-sidebar-border/70 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">New Return Slip</h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Fill in the details below</p>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6">
                                    <div className="space-y-8">
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-3">Basic Information</h3>
                                            <div className="grid grid-cols-1 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Delivery Reference <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        required
                                                        value={formData.DELIVERY_ID}
                                                        onChange={(e) => handleDeliveryChange(e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-input text-gray-900 dark:text-white ${errors.DELIVERY_ID ? 'border-red-500' : 'border-sidebar-border'}`}
                                                    >
                                                        <option value="">Select a delivery</option>
                                                        {availableDeliveries.map(delivery => (
                                                            <option key={delivery.id} value={delivery.id}>
                                                                {delivery.reference_no} - {delivery.supplier_name} - {new Date(delivery.delivery_date).toLocaleDateString()}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors.DELIVERY_ID && <p className="text-red-500 text-xs mt-1">{errors.DELIVERY_ID}</p>}
                                                </div>
                                            </div>

                                            {formData.DELIVERY_ID && (
                                                <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border p-4">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Delivery Information</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">Supplier:</span>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{getSelectedDelivery()?.supplier_name}</p>
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

                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Items to Return</h3>
                                                {formData.DELIVERY_ID && <span className="text-sm text-gray-600 dark:text-gray-400">{availableItems.length} items listed</span>}
                                            </div>

                                            {errors.items && (
                                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.items}</p>
                                                </div>
                                            )}

                                            {/* Available Items List - UPDATED LOGIC */}
                                            {formData.DELIVERY_ID && (
                                                <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border p-4">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Available Items from Delivery</h4>
                                                    {isLoadingItems ? (
                                                        <div className="text-center py-4 text-sm text-gray-500">Loading items...</div>
                                                    ) : (
                                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                                            {availableItems.length === 0 ? (
                                                                <p className="text-sm text-gray-500 italic">No items found.</p>
                                                            ) : (
                                                                availableItems.map(item => {
                                                                    // 1. Check if user selected it in CURRENT form
                                                                    const isSelected = selectedItems.some(selected => selected.ITEM_ID === item.item_id);
                                                                    // 2. Check if item is fully unavailable (0 stock left)
                                                                    const isUnavailable = item.available_quantity <= 0;

                                                                    // 3. Determine the Status Badge based on backend counts
                                                                    let statusBadge = null;
                                                                    if (isUnavailable) {
                                                                        if (item.qty_pending > 0) {
                                                                            statusBadge = <span className="text-[10px] uppercase font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Return Pending</span>;
                                                                        } else if (item.qty_issued > 0) {
                                                                            statusBadge = <span className="text-[10px] uppercase font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Return Issued</span>;
                                                                        } else if (item.qty_delivered > 0) {
                                                                            statusBadge = <span className="text-[10px] uppercase font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Returned & Delivered</span>;
                                                                        } else {
                                                                            statusBadge = <span className="text-[10px] uppercase font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Fully Returned</span>;
                                                                        }
                                                                    }

                                                                    return (
                                                                        <div key={item.item_id} className={`flex justify-between items-center p-3 rounded border border-sidebar-border ${isUnavailable ? 'bg-gray-50 dark:bg-gray-800/50 opacity-90' : 'bg-white dark:bg-sidebar'}`}>
                                                                            <div className="flex-1">
                                                                                <div className="flex items-center gap-2">
                                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.item_name}</p>
                                                                                    {statusBadge}
                                                                                </div>
                                                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                                                                                    <span className={isUnavailable ? "text-gray-500 font-medium" : "text-green-600 font-bold"}>
                                                                                        Qty Available: {item.available_quantity}
                                                                                    </span>
                                                                                    <span>•</span>
                                                                                    <span>Original: {item.original_quantity}</span>
                                                                                    <span>•</span>
                                                                                    <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(item.unit_price)}</span>
                                                                                </p>
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleAddItem(item)}
                                                                                disabled={isSelected || isUnavailable}
                                                                                className={`ml-4 px-3 py-1 text-xs rounded transition-colors ${
                                                                                    isSelected || isUnavailable
                                                                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                                                                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                                                                                }`}
                                                                            >
                                                                                {isSelected ? 'Added' : isUnavailable ? 'Unavailable' : 'Add'}
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                })
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Selected Items Card */}
                                            {selectedItems.length > 0 && (
                                                <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border overflow-hidden">
                                                    <div className="bg-gray-50 dark:bg-sidebar-accent px-4 py-3 border-b border-sidebar-border">
                                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Selected Items ({selectedItems.length})</h4>
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
                                                                    <button type="button" onClick={() => handleRemoveItem(item.ITEM_ID)} className="text-red-600 hover:text-red-700 p-1">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
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
                                                                            className={`w-full px-3 py-1 border rounded text-sm bg-white dark:bg-input text-gray-900 dark:text-white ${errors[`item_${index}_quantity`] ? 'border-red-500' : 'border-sidebar-border'}`}
                                                                        />
                                                                        {errors[`item_${index}_quantity`] && <p className="text-red-500 text-xs mt-1">{errors[`item_${index}_quantity`]}</p>}
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Max: {item.MAX_QUANTITY}</p>
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Total Value</label>
                                                                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(item.QUANTITY * item.UNIT_PRICE)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
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

                                        <div className="space-y-6">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-3">Additional Information</h3>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Remarks</label>
                                                <textarea
                                                    value={formData.REMARKS}
                                                    onChange={(e) => handleInputChange('REMARKS', e.target.value)}
                                                    placeholder="Additional notes..."
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm bg-white dark:bg-input text-gray-900 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="sticky bottom-0 bg-white dark:bg-background pt-6 pb-2 border-t border-sidebar-border/70 -mx-6 px-6 mt-8">
                                        <div className="flex gap-3 justify-between">
                                            <div className="flex gap-3">
                                                <button type="button" onClick={handleReset} className="w-12 h-12 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                </button>
                                                <button type="button" onClick={handleCancel} className="w-12 h-12 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                            <button type="submit" className="flex-1 max-w-xs bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold">Submit Return</button>
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
