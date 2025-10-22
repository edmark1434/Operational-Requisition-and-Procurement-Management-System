import { useState, useEffect } from 'react';
import CATEGORY_OPTIONS from '@/pages/datasets/category';
import SUPPLIER_OPTIONS from '@/pages/datasets/supplier';

interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (itemData: any) => void;
}

export default function AddItemModal({ isOpen, onClose, onSave }: AddItemModalProps) {
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

    // Generate barcode when component mounts or form resets
    useEffect(() => {
        if (isOpen) {
            generateBarcode();
            setErrors({}); // Clear errors when modal opens
        }
    }, [isOpen]);

    const generateBarcode = () => {
        // Generate a random 13-digit barcode starting with 880609 (common prefix)
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
            // Clear supplier error when a supplier is selected
            if (errors.SUPPLIER_ID) {
                setErrors(prev => ({ ...prev, SUPPLIER_ID: '' }));
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            onSave(formData);
            onClose();
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
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

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-sidebar rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-sidebar-border">
                {/* Header - Sticky */}
                <div className="flex-shrink-0 p-6 border-b border-sidebar-border bg-white dark:bg-sidebar sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Add New Item
                        </h2>
                        <button
                            onClick={handleClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white dark:bg-sidebar">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
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

                                    {/* Display selected supplier info (read-only) */}
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
                    </form>
                </div>

                {/* Footer with Actions */}
                <div className="flex-shrink-0 p-6 border-t border-sidebar-border bg-gray-50 dark:bg-sidebar-accent">
                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                        >
                            Reset Form
                        </button>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                            >
                                Add Item
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
