import { useState } from 'react';
import { Edit3, Save, Trash2, Plus, Check } from 'lucide-react';

interface RequisitionItem {
    id: string;
    category: string;
    description: string;
    quantity: string;
    unit_price: string;
    total: string;
    isSaved: boolean;
    itemId?: number;
}

interface RequestedItemsProps {
    items: RequisitionItem[];
    setItems: (items: RequisitionItem[]) => void;
    validationErrors: any;
    setValidationErrors: (errors: any) => void;
    categories: any[];
    systemItems: any[];
    getTotalAmount: () => number;
    updateItem: (id: string, field: keyof RequisitionItem, value: string) => void;
    saveItem: (id: string) => void;
    removeItem: (id: string) => void;
    addNewItem: () => void;
    hasError: (itemId: string, field: 'description' | 'quantity' | 'category') => boolean;
    getItemSuggestions: (description: string) => any[];
    editItem: (id: string) => void;
}

export default function RequestedItems({
                                           items,
                                           setItems,
                                           validationErrors,
                                           setValidationErrors,
                                           categories,
                                           systemItems,
                                           getTotalAmount,
                                           updateItem,
                                           saveItem,
                                           removeItem,
                                           addNewItem,
                                           hasError,
                                           getItemSuggestions,
                                           editItem
                                       }: RequestedItemsProps) {

    return (
        <div className="lg:col-span-2 flex flex-col">
            {/* Requested Items Card */}
            <div className="p-4 border border-gray-200 dark:border-sidebar-border rounded-lg bg-gray-50 dark:bg-sidebar flex-1">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Requested Items ({items.length})
                    </h3>
                    <button
                        type="button"
                        onClick={addNewItem}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-150 ease-in-out"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Item
                    </button>
                </div>

                {validationErrors.items && (
                    <div className="mb-4 p-3 border border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-red-500 text-sm">{validationErrors.items}</p>
                    </div>
                )}

                {/* Items container with dynamic height */}
                <div className={`space-y-3 overflow-y-auto pr-2 ${items.length > 2 ? 'max-h-96' : ''}`}>
                    {items.map((item, index) => {
                        const suggestions = getItemSuggestions(item.description);
                        const showSuggestions = suggestions.length > 0 && !item.isSaved && item.description.trim().length > 2;

                        return (
                            <div
                                key={item.id}
                                className={`p-3 border-2 rounded-lg transition-all duration-300 ${
                                    item.isSaved
                                        ? 'border-green-600 bg-white dark:bg-sidebar-accent'
                                        : validationErrors.items && (!item.description.trim() || !item.quantity.trim() || !item.category.trim())
                                            ? 'border-red-300 dark:border-red-500 bg-white dark:bg-sidebar-accent'
                                            : 'border-gray-200 dark:border-sidebar-border bg-white dark:bg-sidebar-accent'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className={`font-medium text-sm ${
                                        item.isSaved
                                            ? 'text-green-700 dark:text-green-300'
                                            : validationErrors.items && (!item.description.trim() || !item.quantity.trim() || !item.category.trim())
                                                ? 'text-red-700 dark:text-red-300'
                                                : 'text-gray-900 dark:text-white'
                                    }`}>
                                        Item {items.length - index} {item.isSaved && (
                                        <Check className="w-3 h-3 inline ml-1" />
                                    )}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        {item.isSaved ? (
                                            // Edit button for saved items
                                            <button
                                                type="button"
                                                onClick={() => editItem(item.id)}
                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-input dark:border-sidebar-border dark:text-gray-300 border border-blue-200 rounded-lg transition duration-150 ease-in-out group"
                                                title="Edit item"
                                            >
                                                <Edit3 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                                Edit
                                            </button>
                                        ) : (
                                            // Save button for unsaved items
                                            <button
                                                type="button"
                                                onClick={() => saveItem(item.id)}
                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-800 dark:hover:bg-green-700 rounded-lg transition duration-150 ease-in-out group"
                                                title="Save item"
                                            >
                                                <Save className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                                Save
                                            </button>
                                        )}
                                        {items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(item.id)}
                                                className="flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition duration-150 ease-in-out group"
                                                title="Remove item"
                                            >
                                                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    {/* Category Select */}
                                    <div>
                                        <select
                                            value={item.category}
                                            onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                                            className={`w-full px-2 py-1 text-sm border rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                                item.isSaved
                                                    ? 'bg-white dark:bg-gray-700 border-green-300 dark:border-green-600 text-gray-900 dark:text-white'
                                                    : hasError(item.id, 'category')
                                                        ? 'border-red-500 dark:border-red-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white'
                                                        : 'bg-white dark:bg-input border-gray-300 dark:border-sidebar-border text-gray-900 dark:text-white'
                                            }`}
                                            required
                                            disabled={item.isSaved}
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(category => (
                                                <option key={category.id} value={category.name}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                            className={`w-full px-2 py-1 text-sm border rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                                item.isSaved
                                                    ? 'bg-white dark:bg-gray-700 border-green-300 dark:border-green-600 text-gray-900 dark:text-white'
                                                    : hasError(item.id, 'description')
                                                        ? 'border-red-500 dark:border-red-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white'
                                                        : 'bg-white dark:bg-input border-gray-300 dark:border-sidebar-border text-gray-900 dark:text-white'
                                            }`}
                                            placeholder="Enter item an description"
                                            required
                                            disabled={item.isSaved}
                                        />
                                        {showSuggestions && (
                                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-sidebar-border rounded-lg shadow-lg">
                                                {suggestions.map(suggestion => (
                                                    <div
                                                        key={suggestion.id}
                                                        className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-200 dark:border-sidebar-border last:border-b-0"
                                                        onClick={() => {
                                                            updateItem(item.id, 'description', suggestion.name);
                                                            updateItem(item.id, 'category', suggestion.category);
                                                            updateItem(item.id, 'unit_price', suggestion.unitPrice.toString());
                                                        }}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {suggestion.name}
                                                            </span>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                ${suggestion.unitPrice}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{suggestion.category}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                                                min="1"
                                                className={`w-full px-2 py-1 text-sm border rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                                    item.isSaved
                                                        ? 'bg-white dark:bg-gray-700 border-green-300 dark:border-green-600 text-gray-900 dark:text-white'
                                                        : hasError(item.id, 'quantity')
                                                            ? 'border-red-500 dark:border-red-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white'
                                                            : 'bg-white dark:bg-input border-gray-300 dark:border-sidebar-border text-gray-900 dark:text-white'
                                                }`}
                                                placeholder="Quantity"
                                                required
                                                disabled={item.isSaved}
                                            />
                                        </div>

                                        <div>
                                            <input
                                                type="number"
                                                value={item.unit_price}
                                                onChange={(e) => updateItem(item.id, 'unit_price', e.target.value)}
                                                min="0"
                                                step="0.01"
                                                className={`w-full px-2 py-1 text-sm border rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                                    item.isSaved
                                                        ? 'bg-white dark:bg-gray-700 border-green-300 dark:border-green-600 text-gray-900 dark:text-white'
                                                        : 'bg-white dark:bg-input border-gray-300 dark:border-sidebar-border text-gray-900 dark:text-white'
                                                }`}
                                                placeholder="Unit Price"
                                                disabled={item.isSaved}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className={`w-full px-2 py-1 text-sm border rounded shadow-sm font-medium text-center ${
                                            item.isSaved
                                                ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-600 text-green-700 dark:text-green-300'
                                                : 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                                        }`}>
                                            {item.total ? `$${parseFloat(item.total).toLocaleString()}` : '₱ 0.00'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Total Amount Card */}
            <div className="mt-3 p-3 border border-gray-200 dark:border-sidebar-border rounded-lg bg-white dark:bg-sidebar-accent">
                <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-900 dark:text-white">
                        Total Amount:
                    </span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        ₱ {getTotalAmount().toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
}
