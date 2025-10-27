import { Edit3, Save, Trash2, Plus, Check } from 'lucide-react';
import items from '../../../datasets/items';
import categories from '../../../datasets/category';

interface RequisitionItem {
    id: string;
    category: string;
    itemName: string;
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
    hasError: (itemId: string, field: 'description' | 'quantity' | 'category' | 'itemName') => boolean;
    getItemSuggestions: (description: string) => any[];
    editItem: (id: string) => void;
}

export default function RequestedItems({
                                           items: requisitionItems,
                                           validationErrors,
                                           categories: propCategories,
                                           updateItem,
                                           saveItem,
                                           removeItem,
                                           addNewItem,
                                           hasError,
                                           getItemSuggestions,
                                           editItem
                                       }: RequestedItemsProps) {

    // Use propCategories if available, otherwise fallback to imported categories
    const categoriesToUse = propCategories && propCategories.length > 0 ? propCategories : categories.map(cat => ({
        id: cat.CAT_ID,
        name: cat.NAME,
        description: cat.DESCRIPTION
    }));

    // Function to get filtered items based on selected category
    const getFilteredItems = (categoryName: string) => {
        if (!categoryName) return [];

        // Find the category ID from the category name
        const selectedCategory = categoriesToUse.find(cat => cat.name === categoryName);
        if (!selectedCategory) return [];

        // Filter items by category ID
        return items.filter(item => {
            const category = categoriesToUse.find(cat => cat.name === categoryName);
            return category && item.CATEGORY_ID === category.id;
        });
    };

    // Handle item name selection - ONLY update itemName and unit_price, NOT description
    const handleItemNameChange = (itemId: string, selectedItemName: string, categoryName: string) => {
        if (!selectedItemName) {
            // Clear itemName and unit_price if empty
            updateItem(itemId, 'itemName', '');
            updateItem(itemId, 'unit_price', '');
            updateItem(itemId, 'total', '');
            return;
        }

        // Find the selected item from filtered items
        const filteredItems = getFilteredItems(categoryName);
        const selectedItem = filteredItems.find(item => item.NAME === selectedItemName);

        if (selectedItem) {
            // Only update itemName and unit_price, leave description completely unchanged
            updateItem(itemId, 'itemName', selectedItemName);
            updateItem(itemId, 'unit_price', selectedItem.UNIT_PRICE.toString());

            // Recalculate total based on current quantity
            const currentItem = requisitionItems.find(item => item.id === itemId);
            if (currentItem) {
                const quantity = parseFloat(currentItem.quantity) || 0;
                const total = (quantity * selectedItem.UNIT_PRICE).toFixed(2);
                updateItem(itemId, 'total', total);
            }
        }
    };

    return (
        <div className="lg:col-span-2 flex flex-col">
            {/* Requested Items Card */}
            <div className="p-4 border border-gray-200 dark:border-sidebar-border rounded-lg bg-gray-50 dark:bg-sidebar flex-1">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Requested Items ({requisitionItems.length})
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
                <div className={`space-y-3 overflow-y-auto pr-2 ${requisitionItems.length > 2 ? 'max-h-96' : ''}`}>
                    {requisitionItems.map((item, index) => {
                        const suggestions = getItemSuggestions(item.description);
                        const showSuggestions = suggestions.length > 0 && !item.isSaved && item.description.trim().length > 2;
                        const filteredItems = getFilteredItems(item.category);

                        return (
                            <div
                                key={item.id}
                                className={`p-3 border-2 rounded-lg transition-all duration-300 ${
                                    item.isSaved
                                        ? 'border-green-600 bg-white dark:bg-sidebar-accent'
                                        : validationErrors.items && (!item.itemName.trim() || !item.quantity.trim() || !item.category.trim())
                                            ? 'border-red-300 dark:border-red-500 bg-white dark:bg-sidebar-accent'
                                            : 'border-gray-200 dark:border-sidebar-border bg-white dark:bg-sidebar-accent'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className={`font-medium text-sm ${
                                        item.isSaved
                                            ? 'text-green-700 dark:text-green-300'
                                            : validationErrors.items && (!item.itemName.trim() || !item.quantity.trim() || !item.category.trim())
                                                ? 'text-red-700 dark:text-red-300'
                                                : 'text-gray-900 dark:text-white'
                                    }`}>
                                        Item {requisitionItems.length - index} {item.isSaved && (
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
                                        {requisitionItems.length > 1 && (
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
                                            onChange={(e) => {
                                                updateItem(item.id, 'category', e.target.value);
                                                // Clear the item name when category changes
                                                updateItem(item.id, 'itemName', '');
                                                updateItem(item.id, 'unit_price', '');
                                                updateItem(item.id, 'total', '');
                                            }}
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
                                            {categoriesToUse.map(category => (
                                                <option key={category.id} value={category.name}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Item Name Dropdown - Filtered by selected category */}
                                    <div>
                                        <select
                                            value={item.itemName}
                                            onChange={(e) => handleItemNameChange(item.id, e.target.value, item.category)}
                                            className={`w-full px-2 py-1 text-sm border rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                                item.isSaved
                                                    ? 'bg-white dark:bg-gray-700 border-green-300 dark:border-green-600 text-gray-900 dark:text-white'
                                                    : hasError(item.id, 'itemName')
                                                        ? 'border-red-500 dark:border-red-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white'
                                                        : 'bg-white dark:bg-input border-gray-300 dark:border-sidebar-border text-gray-900 dark:text-white'
                                            }`}
                                            required
                                            disabled={item.isSaved || !item.category}
                                        >
                                            <option value="">
                                                {item.category ? 'Select Item Name' : 'Select category first'}
                                            </option>
                                            {filteredItems.map(itemData => (
                                                <option key={itemData.ITEM_ID} value={itemData.NAME}>
                                                    {itemData.NAME}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Description Input - Completely separate from Item Name */}
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
                                            placeholder="Enter item description"
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
                                                            // Only update description and category, NOT itemName
                                                            updateItem(item.id, 'description', suggestion.name);
                                                            updateItem(item.id, 'category', suggestion.category);
                                                        }}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {suggestion.name}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{suggestion.category}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Quantity Input */}
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
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
