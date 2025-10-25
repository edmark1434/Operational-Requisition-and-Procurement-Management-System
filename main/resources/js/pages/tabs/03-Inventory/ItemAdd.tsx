// ItemAdd.tsx
import AppLayout from '@/layouts/app-layout';
import { inventory } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import CATEGORY_OPTIONS from '@/pages/datasets/category';
import SUPPLIER_OPTIONS from '@/pages/datasets/supplier';
import itemsData from "@/pages/datasets/items";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory',
        href: inventory().url,
    },
    {
        title: 'Add New Item',
        href: '/inventory/add',
    },
];

export default function ItemAdd({ auth }: { auth: any }) {
    const [formData, setFormData] = useState({
        NAME: '',
        BARCODE: '',
        CATEGORY: '',
        UNIT_PRICE: 0,
        CURRENT_STOCK: 0,
        DIMENSIONS: '',
        MAKE_ID: 1,
        SUPPLIER_ID: '',
        SUPPLIER_NAME: '',
        SUPPLIER_EMAIL: '',
        SUPPLIER_CONTACT_NUMBER: ''
    });
    const [errors, setErrors] = useState<{[key: string]: string}>({});

    // Generate barcode on component mount
    useEffect(() => {
        generateBarcode();
    }, []);

    const generateBarcode = () => {
        const randomPart = Math.floor(1000000000 + Math.random() * 9000000000).toString().substring(0, 7);
        const barcode = `880609${randomPart}`;
        setFormData(prev => ({ ...prev, BARCODE: barcode }));
    };

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};

        if (!formData.NAME.trim()) {
            newErrors.NAME = 'Item name is required';
        }

        if (!formData.CATEGORY) {
            newErrors.CATEGORY = 'Category is required';
        }

        if (!formData.UNIT_PRICE || formData.UNIT_PRICE <= 0) {
            newErrors.UNIT_PRICE = 'Unit price must be greater than 0';
        }

        if (formData.CURRENT_STOCK < 0) {
            newErrors.CURRENT_STOCK = 'Current stock cannot be negative';
        }

        if (!formData.DIMENSIONS.trim()) {
            newErrors.DIMENSIONS = 'Dimensions are required';
        }

        if (!formData.SUPPLIER_ID) {
            newErrors.SUPPLIER_ID = 'Supplier is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSupplierChange = (supplierId: string) => {
        const selectedSupplier = SUPPLIER_OPTIONS.find(s => s.ID.toString() === supplierId);
        if (selectedSupplier) {
            setFormData(prev => ({
                ...prev,
                SUPPLIER_ID: supplierId,
                SUPPLIER_NAME: selectedSupplier.NAME,
                SUPPLIER_EMAIL: selectedSupplier.EMAIL,
                SUPPLIER_CONTACT_NUMBER: selectedSupplier.CONTACT_NUMBER
            }));
            if (errors.SUPPLIER_ID) {
                setErrors(prev => ({ ...prev, SUPPLIER_ID: '' }));
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            // Generate new item ID
            const newItemId = Math.max(...itemsData.map(item => item.ITEM_ID), 0) + 1;

            // Prepare item data
            const itemData = {
                ITEM_ID: newItemId,
                ...formData,
                CATEGORY_ID: CATEGORY_OPTIONS.find(cat => cat.NAME === formData.CATEGORY)?.CAT_ID || 1,
                SUPPLIER_ID: parseInt(formData.SUPPLIER_ID),
                CREATED_AT: new Date().toISOString(),
                UPDATED_AT: new Date().toISOString()
            };

            console.log('New Item Data:', itemData);

            // In real application, you would send POST request to backend
            alert('Item added successfully!');

            // Redirect back to inventory list
            router.visit(inventory().url);
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
            NAME: '',
            BARCODE: '',
            CATEGORY: '',
            UNIT_PRICE: 0,
            CURRENT_STOCK: 0,
            DIMENSIONS: '',
            MAKE_ID: 1,
            SUPPLIER_ID: '',
            SUPPLIER_NAME: '',
            SUPPLIER_EMAIL: '',
            SUPPLIER_CONTACT_NUMBER: ''
        });
        setErrors({});
        generateBarcode();
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.visit(inventory().url);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add New Item" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Add New Item</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Add a new item to your inventory
                        </p>
                    </div>
                    <Link
                        href={inventory().url}
                        className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                    >
                        Return to Inventory
                    </Link>
                </div>

                {/* Form Container */}
                <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-white dark:bg-sidebar">
                    <div className="h-full overflow-y-auto">
                        <div className="min-h-full flex items-start justify-center p-6">
                            <div className="w-full max-w-4xl bg-white dark:bg-background rounded-xl border border-sidebar-border/70 shadow-lg">
                                {/* Header Section */}
                                <div className="border-b border-sidebar-border/70 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        New Item Details
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Fill in the details below to add a new item to inventory
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6">
                                    <div className="space-y-6">
                                        {/* Basic Information */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Basic Information
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Item Name <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.NAME}
                                                        onChange={(e) => handleInputChange('NAME', e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                            errors.NAME ? 'border-red-500' : 'border-sidebar-border'
                                                        }`}
                                                        placeholder="Enter item name"
                                                    />
                                                    {errors.NAME && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.NAME}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Barcode
                                                    </label>
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={formData.BARCODE}
                                                        className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm bg-gray-50 dark:bg-input text-gray-900 dark:text-white font-mono cursor-not-allowed"
                                                    />
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        Auto-generated barcode
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Category <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        required
                                                        value={formData.CATEGORY}
                                                        onChange={(e) => handleInputChange('CATEGORY', e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                            errors.CATEGORY ? 'border-red-500' : 'border-sidebar-border'
                                                        }`}
                                                    >
                                                        <option value="">Select a category</option>
                                                        {CATEGORY_OPTIONS.map(category => (
                                                            <option key={category.CAT_ID} value={category.NAME}>
                                                                {category.NAME}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors.CATEGORY && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.CATEGORY}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Unit Price <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        required
                                                        min="0"
                                                        step="0.01"
                                                        value={formData.UNIT_PRICE}
                                                        onChange={(e) => handleInputChange('UNIT_PRICE', parseFloat(e.target.value) || 0)}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                            errors.UNIT_PRICE ? 'border-red-500' : 'border-sidebar-border'
                                                        }`}
                                                        placeholder="0.00"
                                                    />
                                                    {errors.UNIT_PRICE && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.UNIT_PRICE}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Current Stock <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        required
                                                        min="0"
                                                        value={formData.CURRENT_STOCK}
                                                        onChange={(e) => handleInputChange('CURRENT_STOCK', parseInt(e.target.value) || 0)}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                            errors.CURRENT_STOCK ? 'border-red-500' : 'border-sidebar-border'
                                                        }`}
                                                        placeholder="0"
                                                    />
                                                    {errors.CURRENT_STOCK && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.CURRENT_STOCK}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Dimensions <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.DIMENSIONS}
                                                        onChange={(e) => handleInputChange('DIMENSIONS', e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                            errors.DIMENSIONS ? 'border-red-500' : 'border-sidebar-border'
                                                        }`}
                                                        placeholder="e.g., 30cm x 15cm x 5cm"
                                                    />
                                                    {errors.DIMENSIONS && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.DIMENSIONS}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Supplier Information */}
                                        <div className="border-t border-sidebar-border pt-6">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                Supplier Information
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Supplier <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        required
                                                        value={formData.SUPPLIER_ID}
                                                        onChange={(e) => handleSupplierChange(e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                            errors.SUPPLIER_ID ? 'border-red-500' : 'border-sidebar-border'
                                                        }`}
                                                    >
                                                        <option value="">Select a supplier</option>
                                                        {SUPPLIER_OPTIONS.map(supplier => (
                                                            <option key={supplier.ID} value={supplier.ID}>
                                                                {supplier.NAME}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors.SUPPLIER_ID && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.SUPPLIER_ID}</p>
                                                    )}
                                                </div>

                                                {/* Display selected supplier info */}
                                                {formData.SUPPLIER_ID && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                Email
                                                            </label>
                                                            <p className="text-sm text-gray-900 dark:text-white">
                                                                {formData.SUPPLIER_EMAIL}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                Contact Number
                                                            </label>
                                                            <p className="text-sm text-gray-900 dark:text-white">
                                                                {formData.SUPPLIER_CONTACT_NUMBER}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
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
                                                Add Item
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
