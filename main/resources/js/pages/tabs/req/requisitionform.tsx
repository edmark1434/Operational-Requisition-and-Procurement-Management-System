import { PlaceholderPattern } from "@/components/ui/placeholder-pattern";
import AppLayout from '@/layouts/app-layout';
import { requisitions, requisitionform } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { UserInfo } from '@/components/user-info';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Requisition Form',
        href: requisitionform().url,
    },
];

interface RequisitionItem {
    id: string;
    description: string;
    quantity: string;
    unit_price: string;
    total: string;
    isSaved: boolean;
}

interface ValidationErrors {
    requestor?: string;
    items?: string;
    [key: string]: string | undefined;
}

export default function RequisitionForm({ auth }: { auth: any }) {
    const [requestorType, setRequestorType] = useState<'self' | 'other'>('self');
    const [otherRequestor, setOtherRequestor] = useState('');
    const [priority, setPriority] = useState('normal');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<RequisitionItem[]>([
        { id: '1', description: '', quantity: '', unit_price: '', total: '', isSaved: false }
    ]);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    const addNewItem = () => {
        const newItem = {
            id: Date.now().toString(),
            description: '',
            quantity: '',
            unit_price: '',
            total: '',
            isSaved: false
        };
        setItems(prev => [newItem, ...prev]); // New items added to top
        // Clear validation errors when adding new item
        setValidationErrors(prev => ({ ...prev, items: undefined }));
    };

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(prev => prev.filter(item => item.id !== id));
        }
    };

    const updateItem = (id: string, field: keyof RequisitionItem, value: string) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value, isSaved: false }; // Mark as unsaved when edited

                // Calculate total if quantity or unit_price changes
                if (field === 'quantity' || field === 'unit_price') {
                    const quantity = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(item.quantity) || 0;
                    const unitPrice = field === 'unit_price' ? parseFloat(value) || 0 : parseFloat(item.unit_price) || 0;
                    updatedItem.total = (quantity * unitPrice).toFixed(2);
                }

                return updatedItem;
            }
            return item;
        }));
        // Clear validation errors when user starts typing
        if (field === 'description' || field === 'quantity') {
            setValidationErrors(prev => ({ ...prev, items: undefined }));
        }
    };

    const saveItem = (id: string) => {
        const itemToSave = items.find(item => item.id === id);
        if (!itemToSave) return;

        // Validate required fields
        if (!itemToSave.description.trim() || !itemToSave.quantity.trim()) {
            alert('Please fill in description and quantity before saving the item.');
            return;
        }

        setItems(prev => {
            const updatedItems = prev.map(item =>
                item.id === id ? { ...item, isSaved: true } : item
            );

            // Move saved item to the bottom
            const savedItem = updatedItems.find(item => item.id === id);
            if (savedItem) {
                const filteredItems = updatedItems.filter(item => item.id !== id);
                return [...filteredItems, savedItem];
            }

            return updatedItems;
        });
    };

    const getTotalAmount = () => {
        return items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
    };

    const validateForm = () => {
        const errors: ValidationErrors = {};

        // Validate requestor
        if (requestorType === 'other' && !otherRequestor.trim()) {
            errors.requestor = 'Requestor name is required';
        }

        // Validate items
        const unsavedItems = items.filter(item => !item.isSaved);
        if (unsavedItems.length > 0) {
            errors.items = 'Please save all items before submitting';
        }

        // Check if there are any items at all
        if (items.length === 0) {
            errors.items = 'Please add at least one item';
        }

        // Check individual item validation
        const invalidItems = items.filter(item =>
            !item.isSaved && (!item.description.trim() || !item.quantity.trim())
        );
        if (invalidItems.length > 0) {
            errors.items = 'All items must have description and quantity filled out before saving';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const formData = {
            requestor: requestorType === 'self' ? auth.user.name : otherRequestor,
            priority,
            notes,
            items: items,
            total_amount: getTotalAmount()
        };
        console.log('Form submitted:', formData);
        // Handle form submission logic here
        alert('Requisition submitted successfully!');
        clearForm();
    };

    const clearForm = () => {
        setRequestorType('self');
        setOtherRequestor('');
        setPriority('normal');
        setNotes('');
        setItems([{ id: '1', description: '', quantity: '', unit_price: '', total: '', isSaved: false }]);

        // Set validation errors to highlight required fields
        setValidationErrors({
            requestor: 'Requestor name is required',
            items: 'Please add and save at least one item'
        });
    };

    // Helper function to check if a specific item field should have red border
    const hasError = (itemId: string, field: 'description' | 'quantity') => {
        const item = items.find(item => item.id === itemId);
        if (!item || item.isSaved) return false;

        if (validationErrors.items) {
            if (field === 'description' && !item.description.trim()) return true;
            if (field === 'quantity' && !item.quantity.trim()) return true;
        }
        return false;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Requisition Form" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Requisition Form</h1>
                    <Link
                        href={requisitions().url}
                        className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                    >
                        Return to Requisitions
                    </Link>
                </div>

                <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-[oklch(0.145_0_0)]">
                    <div className="h-full overflow-y-auto">
                        <div className="min-h-full flex items-start justify-center p-6">
                            <div className="w-full max-w-6xl bg-white dark:bg-background rounded-xl border border-sidebar-border/70 shadow-lg">
                                {/* Header Section */}
                                <div className="border-b border-sidebar-border/70 p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        New Requisition Request
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Complete the form below to submit a new requisition
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6">
                                    {/* Requisition Info */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                        {/* Left Column - Smaller */}
                                        <div className="space-y-6 lg:col-span-1">
                                            {/* Requestor Information */}
                                            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                    Requestor Information
                                                </h3>

                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                                            Requesting For
                                                        </label>
                                                        <div className="flex gap-4">
                                                            <label className="flex items-center">
                                                                <input
                                                                    type="radio"
                                                                    value="self"
                                                                    checked={requestorType === 'self'}
                                                                    onChange={(e) => {
                                                                        setRequestorType(e.target.value as 'self' | 'other');
                                                                        setValidationErrors(prev => ({ ...prev, requestor: undefined }));
                                                                    }}
                                                                    className="mr-2 text-blue-600 focus:ring-blue-500"
                                                                />
                                                                <span className="text-sm text-gray-700 dark:text-gray-300">Myself</span>
                                                            </label>
                                                            <label className="flex items-center">
                                                                <input
                                                                    type="radio"
                                                                    value="other"
                                                                    checked={requestorType === 'other'}
                                                                    onChange={(e) => {
                                                                        setRequestorType(e.target.value as 'self' | 'other');
                                                                        setValidationErrors(prev => ({ ...prev, requestor: undefined }));
                                                                    }}
                                                                    className="mr-2 text-blue-600 focus:ring-blue-500"
                                                                />
                                                                <span className="text-sm text-gray-700 dark:text-gray-300">Someone Else</span>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {requestorType === 'self' ? (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                Requestor
                                                            </label>
                                                            <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                                                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                                                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                                        {auth.user.name.split(' ').map((n: string) => n[0]).join('')}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                        {auth.user.name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                        Logged in user
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                Requestor Name
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={otherRequestor}
                                                                onChange={(e) => {
                                                                    setOtherRequestor(e.target.value);
                                                                    setValidationErrors(prev => ({ ...prev, requestor: undefined }));
                                                                }}
                                                                className={`w-full px-3 py-2 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                                                    validationErrors.requestor
                                                                        ? 'border-red-500 dark:border-red-500'
                                                                        : 'border-gray-300 dark:border-gray-600'
                                                                }`}
                                                                placeholder="Enter requestor's name"
                                                                required
                                                            />
                                                            {validationErrors.requestor && (
                                                                <p className="text-red-500 text-xs mt-1">{validationErrors.requestor}</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Requisition Details */}
                                            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                    Requisition Details
                                                </h3>

                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Priority
                                                        </label>
                                                        <select
                                                            value={priority}
                                                            onChange={(e) => setPriority(e.target.value)}
                                                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                        >
                                                            <option value="low">Low</option>
                                                            <option value="normal">Normal</option>
                                                            <option value="high">High</option>
                                                            <option value="urgent">Urgent</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Notes
                                                        </label>
                                                        <textarea
                                                            value={notes}
                                                            onChange={(e) => setNotes(e.target.value)}
                                                            rows={3}
                                                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                            placeholder="Additional notes or comments..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column - Items Section (Wider) */}
                                        <div className="lg:col-span-2 flex flex-col">
                                            {/* Requested Items Card */}
                                            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 flex-1">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        Requested Items ({items.length})
                                                    </h3>
                                                    <button
                                                        type="button"
                                                        onClick={addNewItem}
                                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-150 ease-in-out"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                        </svg>
                                                        Add New Item
                                                    </button>
                                                </div>

                                                {validationErrors.items && (
                                                    <div className="mb-4 p-3 border border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                                        <p className="text-red-500 text-sm">{validationErrors.items}</p>
                                                    </div>
                                                )}

                                                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                                                    {items.map((item, index) => (
                                                        <div
                                                            key={item.id}
                                                            className={`p-4 border-2 rounded-lg transition-all duration-300 ${
                                                                item.isSaved
                                                                    ? 'border-green-500 bg-white dark:bg-gray-700'
                                                                    : validationErrors.items && (!item.description.trim() || !item.quantity.trim())
                                                                        ? 'border-red-300 dark:border-red-500 bg-white dark:bg-gray-700'
                                                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700'
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between mb-3">
                                                                <h4 className={`font-medium text-sm ${
                                                                    item.isSaved
                                                                        ? 'text-green-700 dark:text-green-300'
                                                                        : validationErrors.items && (!item.description.trim() || !item.quantity.trim())
                                                                            ? 'text-red-700 dark:text-red-300'
                                                                            : 'text-gray-900 dark:text-white'
                                                                }`}>
                                                                    Item {items.length - index} {item.isSaved && '✓'}
                                                                </h4>
                                                                <div className="flex items-center gap-2">
                                                                    {!item.isSaved && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => saveItem(item.id)}
                                                                            className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition duration-150 ease-in-out"
                                                                        >
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                            Save
                                                                        </button>
                                                                    )}
                                                                    {items.length > 1 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeItem(item.id)}
                                                                            className="text-red-600 hover:text-red-700 p-1 rounded transition duration-150 ease-in-out"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                            </svg>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 gap-3">
                                                                <div>
                                                                    <label className={`block text-xs font-medium mb-1 ${
                                                                        item.isSaved
                                                                            ? 'text-green-700 dark:text-green-300'
                                                                            : hasError(item.id, 'description')
                                                                                ? 'text-red-700 dark:text-red-300'
                                                                                : 'text-gray-700 dark:text-gray-300'
                                                                    }`}>
                                                                        Item Description {hasError(item.id, 'description') && '*'}
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={item.description}
                                                                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                                        className={`w-full px-3 py-2 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                                            item.isSaved
                                                                                ? 'bg-white dark:bg-gray-600 border-green-300 dark:border-green-600 text-gray-900 dark:text-white'
                                                                                : hasError(item.id, 'description')
                                                                                    ? 'border-red-500 dark:border-red-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white'
                                                                                    : 'bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
                                                                        }`}
                                                                        placeholder="Enter item description"
                                                                        required
                                                                        disabled={item.isSaved}
                                                                    />
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div>
                                                                        <label className={`block text-xs font-medium mb-1 ${
                                                                            item.isSaved
                                                                                ? 'text-green-700 dark:text-green-300'
                                                                                : hasError(item.id, 'quantity')
                                                                                    ? 'text-red-700 dark:text-red-300'
                                                                                    : 'text-gray-700 dark:text-gray-300'
                                                                        }`}>
                                                                            Quantity {hasError(item.id, 'quantity') && '*'}
                                                                        </label>
                                                                        <input
                                                                            type="number"
                                                                            value={item.quantity}
                                                                            onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                                                                            min="1"
                                                                            className={`w-full px-3 py-2 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                                                item.isSaved
                                                                                    ? 'bg-white dark:bg-gray-600 border-green-300 dark:border-green-600 text-gray-900 dark:text-white'
                                                                                    : hasError(item.id, 'quantity')
                                                                                        ? 'border-red-500 dark:border-red-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white'
                                                                                        : 'bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
                                                                            }`}
                                                                            placeholder="Qty"
                                                                            required
                                                                            disabled={item.isSaved}
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className={`block text-xs font-medium mb-1 ${
                                                                            item.isSaved
                                                                                ? 'text-green-700 dark:text-green-300'
                                                                                : 'text-gray-700 dark:text-gray-300'
                                                                        }`}>
                                                                            Unit Price ($)
                                                                        </label>
                                                                        <input
                                                                            type="number"
                                                                            value={item.unit_price}
                                                                            onChange={(e) => updateItem(item.id, 'unit_price', e.target.value)}
                                                                            min="0"
                                                                            step="0.01"
                                                                            className={`w-full px-3 py-2 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                                                item.isSaved
                                                                                    ? 'bg-white dark:bg-gray-600 border-green-300 dark:border-green-600 text-gray-900 dark:text-white'
                                                                                    : 'bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
                                                                            }`}
                                                                            placeholder="0.00"
                                                                            disabled={item.isSaved}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <label className={`block text-xs font-medium mb-1 ${
                                                                        item.isSaved
                                                                            ? 'text-green-700 dark:text-green-300'
                                                                            : 'text-gray-700 dark:text-gray-300'
                                                                    }`}>
                                                                        Item Total
                                                                    </label>
                                                                    <div className={`w-full px-3 py-2 text-sm border-2 rounded-lg shadow-sm font-medium text-center ${
                                                                        item.isSaved
                                                                            ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-600 text-green-700 dark:text-green-300'
                                                                            : 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                                                                    }`}>
                                                                        {item.total ? `$${parseFloat(item.total).toLocaleString()}` : '$0.00'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Total Amount Card - Now at same level as Notes */}
                                            <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        Total Amount:
                                                    </span>
                                                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                                        ${getTotalAmount().toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons - Always visible at the bottom */}
                                    <div className="sticky bottom-0 bg-white dark:bg-background pt-4 pb-2 border-t border-sidebar-border/70 -mx-6 px-6">
                                        <div className="flex gap-3">
                                            <button
                                                type="submit"
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                            >
                                                Submit Requisition
                                            </button>
                                            <button
                                                type="button"
                                                onClick={clearForm}
                                                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                            >
                                                Clear Form
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
