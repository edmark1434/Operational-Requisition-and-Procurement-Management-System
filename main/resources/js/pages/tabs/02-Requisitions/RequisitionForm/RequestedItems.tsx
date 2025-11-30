import { useState, useEffect } from 'react';
import { Edit3, Save, Trash2, Plus, Check } from 'lucide-react';

// --- Interfaces ---
interface DatabaseCategory {
    id: number;
    name: string;
}

interface DatabaseItem {
    id: number;
    name: string;
    unit_price: number;
    current_stock: number;
}

interface RequisitionItem {
    id: string;
    category: string;
    categoryId?: number; // Needed to fetch specific items
    itemName: string;
    itemId?: number;     // Needed for backend storage
    quantity: string;
    unit_price: string;
    total: string;
    isSaved: boolean;
}

interface RequestedItemsProps {
    items: RequisitionItem[];
    validationErrors: any;
    // We don't need to pass categories/items from parent anymore, we fetch them here
    updateItem: (id: string, field: keyof RequisitionItem, value: string | number) => void;
    saveItem: (id: string) => void;
    removeItem: (id: string) => void;
    addNewItem: () => void;
    hasError: (itemId: string, field: 'quantity' | 'category' | 'itemName') => boolean;
    editItem: (id: string) => void;
}

export default function RequestedItems({
                                           items: requisitionItems,
                                           validationErrors,
                                           updateItem,
                                           saveItem,
                                           removeItem,
                                           addNewItem,
                                           hasError,
                                           editItem
                                       }: RequestedItemsProps) {

    // --- State for Data Fetching ---
    const [fetchedCategories, setFetchedCategories] = useState<DatabaseCategory[]>([]);
    // Cache items: { [categoryId]: [Item1, Item2, ...] } to prevent refetching
    const [itemCache, setItemCache] = useState<Record<number, DatabaseItem[]>>({});
    const [loadingItems, setLoadingItems] = useState<boolean>(false);

    // --- 1. Fetch Categories on Mount ---
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/requisition/api/categories');
                if (response.ok) {
                    const data = await response.json();
                    setFetchedCategories(data);
                }
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchCategories();
    }, []);

    // --- 2. Function to fetch Items by Category ID ---
    const fetchItemsForCategory = async (categoryId: number) => {
        // If we already have this category's items in cache, don't fetch again
        if (itemCache[categoryId]) return;

        setLoadingItems(true);
        try {
            const response = await fetch(`/requisition/api/items/${categoryId}`);
            if (response.ok) {
                const data = await response.json();
                setItemCache(prev => ({ ...prev, [categoryId]: data }));
            }
        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            setLoadingItems(false);
        }
    };

    // --- Handlers ---

    // When Category Changes
    const handleCategoryChange = async (rowId: string, categoryName: string) => {
        const selectedCat = fetchedCategories.find(c => c.name === categoryName);

        // Update the visual category
        updateItem(rowId, 'category', categoryName);

        // Reset item fields because the category changed
        updateItem(rowId, 'itemName', '');
        updateItem(rowId, 'itemId', ''); // Reset ID
        updateItem(rowId, 'unit_price', '');
        updateItem(rowId, 'total', '');

        if (selectedCat) {
            // Save the Category ID (hidden) so we can fetch items
            updateItem(rowId, 'categoryId', selectedCat.id);
            // Fetch the items for this new category
            await fetchItemsForCategory(selectedCat.id);
        }
    };

    // When Item Name Changes
// RequestedItems.tsx

// Inside RequestedItems.tsx

// Change the name of the function to be clearer
    const handleItemSelection = (rowId: string, selectedId: string, categoryId?: number) => {
        // 1. If user selected the placeholder "Select Item", clear everything
        if (!selectedId || !categoryId) {
            updateItem(rowId, 'itemId', ''); // Clear ID
            updateItem(rowId, 'itemName', '');
            updateItem(rowId, 'unit_price', '');
            updateItem(rowId, 'total', '');
            return;
        }

        // 2. Get the list of items for this category
        const availableItems = itemCache[categoryId] || [];

        // 3. Find the item using the ID (Safe and Accurate!)
        // We convert .toString() to ensure we compare string-to-string
        const selectedItem = availableItems.find(item => item.id.toString() === selectedId.toString());

        if (selectedItem) {
            // FOUND IT! Save the ID and the Name
            updateItem(rowId, 'itemId', selectedItem.id.toString());
            updateItem(rowId, 'itemName', selectedItem.name); // We save the name for display
            updateItem(rowId, 'unit_price', selectedItem.unit_price.toString());

            // Optional: Recalculate total if quantity exists
            // (You can add that logic here if you want)
        } else {
            console.error("Critical Error: Selected ID exists in dropdown but not in cache.");
        }
    };

    // When Quantity Changes
    const handleQuantityChange = (itemId: string, quantityValue: string) => {
        const item = requisitionItems.find(i => i.id === itemId);
        if (!item) return;

        updateItem(itemId, 'quantity', quantityValue);

        if (quantityValue && item.unit_price) {
            const quantity = parseFloat(quantityValue) || 0;
            const unitPrice = parseFloat(item.unit_price) || 0;
            const total = (quantity * unitPrice).toFixed(2);
            updateItem(itemId, 'total', total);
        } else {
            updateItem(itemId, 'total', '');
        }
    };

    return (
        <div className="lg:col-span-2 flex flex-col">
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

                <div className={`space-y-3 overflow-y-auto pr-2 ${requisitionItems.length > 2 ? 'max-h-96' : ''}`}>
                    {requisitionItems.map((item, index) => {
                        // Get items specifically for this row's category ID
                        const dropdownItems = item.categoryId ? (itemCache[item.categoryId] || []) : [];

                        return (
                            <div
                                key={item.id}
                                className={`p-3 border-2 rounded-lg transition-all duration-300 ${
                                    item.isSaved
                                        ? 'border-green-600 bg-white dark:bg-sidebar-accent'
                                        : validationErrors.items && (!item.itemName || !item.quantity || !item.category)
                                            ? 'border-red-300 dark:border-red-500 bg-white dark:bg-sidebar-accent'
                                            : 'border-gray-200 dark:border-sidebar-border bg-white dark:bg-sidebar-accent'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                                        Item {requisitionItems.length - index}
                                        {item.isSaved && <Check className="w-3 h-3 inline ml-1 text-green-600" />}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        {item.isSaved ? (
                                            <button
                                                type="button"
                                                onClick={() => editItem(item.id)}
                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" /> Edit
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => saveItem(item.id)}
                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                                            >
                                                <Save className="w-3.5 h-3.5" /> Save
                                            </button>
                                        )}
                                        {requisitionItems.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(item.id)}
                                                className="flex items-center justify-center w-8 h-8 text-red-600 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    {/* 1. Category Select (Fetched from DB) */}
                                    <div>
                                        <select
                                            value={item.category}
                                            onChange={(e) => handleCategoryChange(item.id, e.target.value)}
                                            className="w-full px-2 py-1 text-sm border rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-input border-gray-300 dark:border-sidebar-border text-gray-900 dark:text-white"
                                            required
                                            disabled={item.isSaved}
                                        >
                                            <option value="">Select Category</option>
                                            {fetchedCategories.map(cat => (
                                                <option key={cat.id} value={cat.name}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 2. Item Select (Dynamic based on Category) */}
                                    <div>
                                        <select
                                            // Use itemId as the value. If it's empty, show placeholder
                                            value={item.itemId || ""}
                                            // Pass the ID (e.target.value) to our new function
                                            onChange={(e) => handleItemSelection(item.id, e.target.value, item.categoryId)}
                                            className="w-full px-2 py-1 text-sm border rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-input border-gray-300 dark:border-sidebar-border text-gray-900 dark:text-white"
                                            required
                                            disabled={item.isSaved || !item.category}
                                        >
                                            <option value="">
                                                {item.category ? 'Select Item Name' : 'Select category first'}
                                            </option>

                                            {dropdownItems.map(itemData => (
                                                // KEY CHANGE: Value is now the ID, not the Name
                                                <option key={itemData.id} value={itemData.id}>
                                                    {itemData.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 3. Quantity Input */}
                                    <div>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                            min="1"
                                            className="w-full px-2 py-1 text-sm border rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-input border-gray-300 dark:border-sidebar-border text-gray-900 dark:text-white"
                                            placeholder="Enter quantity"
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
