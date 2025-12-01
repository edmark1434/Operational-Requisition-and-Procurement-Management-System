// ItemAdd.tsx
import AppLayout from '@/layouts/app-layout';
import { inventory, inventoryCreate } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import CATEGORY_OPTIONS from '@/pages/datasets/category';
import SUPPLIER_OPTIONS from '@/pages/datasets/supplier';
import itemsData from "@/pages/datasets/items";
import categorySuppliers from '@/pages/datasets/category_supplier'; // Import the mapping
import { toast, Toaster } from 'sonner';

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
interface Prop{
    auth: any,
    CATEGORY_OPTIONS:any[]
}
export default function ItemAdd({ auth,CATEGORY_OPTIONS }: Prop) {
    const [formData, setFormData] = useState({
        NAME: '',
        BARCODE: '',
        CATEGORY: '',
        UNIT_PRICE: '',
        CURRENT_STOCK: '',
        DIMENSIONS: '',
        MAKE_ID: 1,
        SUPPLIER_ID: '',
        SUPPLIER_NAME: '',
        SUPPLIER_EMAIL: '',
        SUPPLIER_CONTACT_NUMBER: ''
    });
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [filteredSuppliers, setFilteredSuppliers] = useState(SUPPLIER_OPTIONS);

    // Filter suppliers based on selected category
    useEffect(() => {
        if (formData.CATEGORY) {
            // Find the category ID from CATEGORY_OPTIONS
            const selectedCategory = CATEGORY_OPTIONS.find(cat => cat.NAME === formData.CATEGORY);

            if (selectedCategory) {
                // Find supplier IDs that match this category
                const supplierIdsForCategory = categorySuppliers
                    .filter(cs => cs.CATEGORY_ID === selectedCategory.CAT_ID)
                    .map(cs => cs.SUPPLIER_ID);

                // Filter suppliers based on the matched IDs
                const filtered = SUPPLIER_OPTIONS.filter(supplier =>
                    supplierIdsForCategory.includes(supplier.ID)
                );
                setFilteredSuppliers(filtered);

                // If current selected supplier is not in the filtered list, clear it
                if (formData.SUPPLIER_ID && !filtered.some(s => s.ID.toString() === formData.SUPPLIER_ID)) {
                    setFormData(prev => ({
                        ...prev,
                        SUPPLIER_ID: '',
                        SUPPLIER_NAME: '',
                        SUPPLIER_EMAIL: '',
                        SUPPLIER_CONTACT_NUMBER: ''
                    }));
                }
            }
        } else {
            // If no category selected, show all suppliers
            setFilteredSuppliers(SUPPLIER_OPTIONS);
        }
    }, [formData.CATEGORY, formData.SUPPLIER_ID]);

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};

        if (!formData.NAME.trim()) {
            newErrors.NAME = 'Item name is required';
        }

        if (!formData.BARCODE.trim()) {
            newErrors.BARCODE = 'Barcode is required';
        }

        if (!formData.CATEGORY) {
            newErrors.CATEGORY = 'Category is required';
        }

        if (!formData.UNIT_PRICE || parseFloat(formData.UNIT_PRICE) <= 0) {
            newErrors.UNIT_PRICE = 'Unit price must be greater than 0';
        }

        if (!formData.CURRENT_STOCK || parseInt(formData.CURRENT_STOCK) < 0) {
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
                ...formData,
                UNIT_PRICE: parseFloat(formData.UNIT_PRICE),
                CURRENT_STOCK: parseInt(formData.CURRENT_STOCK),
                CATEGORY_ID: CATEGORY_OPTIONS.find(cat => cat.NAME === formData.CATEGORY)?.CAT_ID || 1,
                SUPPLIER_ID: parseInt(formData.SUPPLIER_ID),
            };

            router.post(inventoryCreate(), itemData, {
                onError: (err) => {
                    toast('error occurs ' + err);
                }
            })
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
            UNIT_PRICE: '',
            CURRENT_STOCK: '',
            DIMENSIONS: '',
            MAKE_ID: 1,
            SUPPLIER_ID: '',
            SUPPLIER_NAME: '',
            SUPPLIER_EMAIL: '',
            SUPPLIER_CONTACT_NUMBER: ''
        });
        setErrors({});
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Item</h1>
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

                {/* Form Container - Updated to match requisition form */}
                <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-[oklch(0.145_0_0)]">
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
                                    <div className="space-y-8">
                                        {/* Basic Information */}
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-3">
                                                Basic Information
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                        Barcode <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.BARCODE}
                                                        onChange={(e) => handleInputChange('BARCODE', e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white font-mono ${
                                                            errors.BARCODE ? 'border-red-500' : 'border-sidebar-border'
                                                        }`}
                                                        placeholder="Enter barcode"
                                                    />
                                                    {errors.BARCODE && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.BARCODE}</p>
                                                    )}
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        Enter the barcode for this item
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                        onChange={(e) => handleInputChange('UNIT_PRICE', e.target.value)}
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

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Current Stock <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        required
                                                        min="0"
                                                        value={formData.CURRENT_STOCK}
                                                        onChange={(e) => handleInputChange('CURRENT_STOCK', e.target.value)}
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
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-3">
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
                                                        {filteredSuppliers.map(supplier => {
                                                            // Find the category names for this supplier
                                                            const supplierCategories = categorySuppliers
                                                                .filter(cs => cs.SUPPLIER_ID === supplier.ID)
                                                                .map(cs => {
                                                                    const category = CATEGORY_OPTIONS.find(cat => cat.CAT_ID === cs.CATEGORY_ID);
                                                                    return category ? category.NAME : '';
                                                                })
                                                                .filter(name => name !== '');

                                                            return (
                                                                <option key={supplier.ID} value={supplier.ID}>
                                                                    {supplier.NAME}
                                                                    {supplierCategories.length > 0 && ` (${supplierCategories.join(', ')})`}
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                    {errors.SUPPLIER_ID && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.SUPPLIER_ID}</p>
                                                    )}
                                                    {formData.CATEGORY && (
                                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                            Showing {filteredSuppliers.length} supplier(s) compatible with{" "}
                                                            <span className="font-semibold">{formData.CATEGORY}</span>
                                                        </p>
                                                    )}
                                                    {formData.CATEGORY && filteredSuppliers.length === 0 && (
                                                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                                            No suppliers found for <span className="font-semibold">{formData.CATEGORY}</span>. Please select a different category.
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Display selected supplier info */}
                                                {formData.SUPPLIER_ID && (
                                                    <div className="space-y-4 p-4 bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border">
                                                        {/* Supplier Categories */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                Supplier Categories
                                                            </label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {(() => {
                                                                    const selectedSupplierCategories = categorySuppliers
                                                                        .filter(cs => cs.SUPPLIER_ID === parseInt(formData.SUPPLIER_ID))
                                                                        .map(cs => {
                                                                            const category = CATEGORY_OPTIONS.find(cat => cat.CAT_ID === cs.CATEGORY_ID);
                                                                            return category ? category.NAME : '';
                                                                        })
                                                                        .filter(name => name !== '');

                                                                    return selectedSupplierCategories.map((categoryName, index) => (
                                                                        <span
                                                                            key={index}
                                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                                categoryName === formData.CATEGORY
                                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-300 dark:border-green-700'
                                                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600'
                                                                            }`}
                                                                        >
                                    {categoryName}
                                                                            {categoryName === formData.CATEGORY && (
                                                                                <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                                </svg>
                                                                            )}
                                </span>
                                                                    ));
                                                                })()}
                                                            </div>
                                                            {formData.CATEGORY && (
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                                    <span className="text-green-600 dark:text-green-400">Green tags</span> indicate categories that match your selected item category
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Supplier Contact Information */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
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
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="sticky bottom-0 bg-white dark:bg-background pt-6 pb-2 border-t border-sidebar-border/70 -mx-6 px-6 mt-8">
                                        <div className="flex gap-3 justify-between">
                                            <div className="flex gap-3">
                                                {/* Reset Button - Circle with icon and tooltip */}
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

                                            {/* Add Item Button - Kept as before */}
                                            <button
                                                type="submit"
                                                className="flex-1 max-w-xs bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
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
            <Toaster/>
        </AppLayout>
    );
}
