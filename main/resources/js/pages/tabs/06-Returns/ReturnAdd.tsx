import AppLayout from '@/layouts/app-layout';
import { returns } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios'; // Import Axios

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Returns', href: returns().url },
    { title: 'Return Slip', href: '/returns/add' },
];

// Define Props Interface
interface Props {
    auth: any;
    availableDeliveries: Array<{
        id: number;
        reference_no: string;
        supplier_name: string;
        delivery_date: string;
    }>;
}

export default function ReturnAdd({ auth, availableDeliveries }: Props) {
    const [formData, setFormData] = useState({
        DELIVERY_ID: '',
        REFERENCE_NO: '',
        // FIX: Default to today's date so submission works without the input
        RETURN_DATE: new Date().toISOString().split('T')[0],
        REMARKS: '',
        STATUS: 'pending'
    });

    // Items the user has chosen to return
    const [selectedItems, setSelectedItems] = useState<Array<{
        ITEM_ID: number;
        ITEM_NAME: string;
        QUANTITY: number;
        UNIT_PRICE: number;
        MAX_QUANTITY: number;
    }>>([]);

    // Items available from the selected delivery (fetched from DB)
    const [availableItems, setAvailableItems] = useState<any[]>([]);

    const [errors, setErrors] = useState<{[key: string]: string}>({});

    // Generate reference on mount (Backend generates actual ref, this is just for state consistency)
    useEffect(() => {
        generateReferenceNo();
    }, []);

    const generateReferenceNo = () => {
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000);
        const referenceNo = `RET-${timestamp}${random}`.slice(0, 15);
        setFormData(prev => ({ ...prev, REFERENCE_NO: referenceNo }));
    };

    // --- LOGIC: Fetch Items when Delivery Changes ---
    const handleDeliveryChange = async (deliveryId: string) => {
        setFormData(prev => ({ ...prev, DELIVERY_ID: deliveryId }));
        setSelectedItems([]); // Clear selected items
        setAvailableItems([]); // Clear previous available items

        if (!deliveryId) return;

        try {
            // Fetch items from the Laravel API endpoint we created
            const response = await axios.get(`/api/delivery/${deliveryId}/items`);
            setAvailableItems(response.data);
        } catch (error) {
            console.error("Failed to load delivery items", error);
            alert("Could not load items for this delivery.");
        }
    };

    const handleAddItem = (item: any) => {
        const existingItem = selectedItems.find(selected => selected.ITEM_ID === item.item_id);

        if (!existingItem) {
            setSelectedItems(prev => [...prev, {
                ITEM_ID: item.item_id, // Map backend 'item_id' to frontend 'ITEM_ID'
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
        return availableDeliveries.find(d => d.id.toString() === formData.DELIVERY_ID);
    };

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};
        if (!formData.DELIVERY_ID) newErrors.DELIVERY_ID = 'Delivery reference is required';
        if (selectedItems.length === 0) newErrors.items = 'At least one item must be selected';
        // Date is now defaulted, but we keep validation just in case
        if (!formData.RETURN_DATE) newErrors.RETURN_DATE = 'Return date is required';

        selectedItems.forEach((item, index) => {
            if (item.QUANTITY <= 0) newErrors[`item_${index}_quantity`] = 'Invalid quantity';
            if (item.QUANTITY > item.MAX_QUANTITY) newErrors[`item_${index}_quantity`] = `Max: ${item.MAX_QUANTITY}`;
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        // Transform data for backend
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
            onError: (err: any) => setErrors(err)
        });
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
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
                    <Link href={returns().url} className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-white">
                        Return Back
                    </Link>
                </div>

                <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border bg-white dark:bg-sidebar">
                    <div className="h-full overflow-y-auto p-6">
                        <div className="w-full max-w-6xl mx-auto bg-white dark:bg-background rounded-xl border border-sidebar-border shadow-lg">

                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="space-y-8">
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold border-b pb-3">Basic Information</h3>

                                        {/* Removed Reference Number and Return Date Inputs */}

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Delivery Reference *</label>
                                            <select
                                                required
                                                value={formData.DELIVERY_ID}
                                                onChange={(e) => handleDeliveryChange(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg"
                                            >
                                                <option value="">Select a delivery</option>
                                                {availableDeliveries.map(delivery => (
                                                    <option key={delivery.id} value={delivery.id}>
                                                        {delivery.reference_no} - {delivery.supplier_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Available Items Section */}
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-semibold">Items to Return</h3>
                                            {formData.DELIVERY_ID && (
                                                <span className="text-sm text-gray-500">{availableItems.length} items available</span>
                                            )}
                                        </div>

                                        {/* List of Available Items from DB */}
                                        {formData.DELIVERY_ID && (
                                            <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg p-4 border">
                                                <h4 className="text-sm font-medium mb-3">Available Items from Delivery</h4>
                                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                                    {availableItems.length === 0 ? (
                                                        <p className="text-sm text-gray-500">No items found for this delivery.</p>
                                                    ) : (
                                                        availableItems.map(item => (
                                                            <div key={item.item_id} className="flex justify-between items-center p-3 bg-white border rounded">
                                                                <div>
                                                                    <p className="text-sm font-medium">{item.item_name}</p>
                                                                    <p className="text-xs text-gray-500">
                                                                        Delivered Qty: {item.available_quantity} • Price: {item.unit_price}
                                                                    </p>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleAddItem(item)}
                                                                    disabled={selectedItems.some(s => s.ITEM_ID === item.item_id)}
                                                                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                                                >
                                                                    Add
                                                                </button>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Selected Items List */}
                                        {selectedItems.length > 0 && (
                                            <div className="bg-white border rounded-lg overflow-hidden">
                                                <div className="bg-gray-50 px-4 py-3 border-b">
                                                    <h4 className="text-sm font-medium">Selected for Return</h4>
                                                </div>
                                                <div className="divide-y">
                                                    {selectedItems.map((item, index) => (
                                                        <div key={item.ITEM_ID} className="p-4 flex flex-col gap-3">
                                                            <div className="flex justify-between">
                                                                <span className="font-medium">{item.ITEM_NAME}</span>
                                                                <button type="button" onClick={() => handleRemoveItem(item.ITEM_ID)} className="text-red-500">Remove</button>
                                                            </div>
                                                            <div className="flex gap-4 items-center">
                                                                <div className="w-1/2">
                                                                    <label className="text-xs">Quantity</label>
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        max={item.MAX_QUANTITY}
                                                                        value={item.QUANTITY}
                                                                        onChange={(e) => handleItemQuantityChange(item.ITEM_ID, parseInt(e.target.value) || 0)}
                                                                        className="w-full border rounded px-2 py-1 text-sm"
                                                                    />
                                                                    {errors[`item_${index}_quantity`] && (
                                                                        <p className="text-red-500 text-xs">{errors[`item_${index}_quantity`]}</p>
                                                                    )}
                                                                </div>
                                                                <div className="w-1/2">
                                                                    <label className="text-xs">Total Value</label>
                                                                    <p className="font-bold text-blue-600">
                                                                        {(item.QUANTITY * item.UNIT_PRICE).toFixed(2)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="bg-gray-50 px-4 py-3 border-t flex justify-between">
                                                    <span className="font-bold">Total Return Value:</span>
                                                    <span className="font-bold text-blue-600">{getTotalValue().toFixed(2)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Remarks */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Remarks</label>
                                        <textarea
                                            value={formData.REMARKS}
                                            onChange={(e) => handleInputChange('REMARKS', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border rounded-lg"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t">
                                        <button type="button" onClick={() => router.visit(returns().url)} className="flex-1 bg-gray-200 py-3 rounded-lg">Cancel</button>
                                        <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">Submit Return</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
