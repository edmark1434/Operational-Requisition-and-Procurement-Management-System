import { useState, useEffect, useRef } from 'react';
import { Edit3, Save, Trash2, Plus, Check } from 'lucide-react';

// --- Interfaces ---
interface RequisitionItem {
    id: string;
    category: string;
    categoryId?: number;
    itemName: string;
    itemId?: number;
    quantity: string;
    approved_qty: string; // <--- ADDED: Approved Quantity field
    unit_price: string;
    total: string;
    isSaved: boolean;
}

interface DatabaseItem {
    id: number;
    name: string;
    unit_price: number;
    current_stock: number;
}

interface RequestedItemsProps {
    items: RequisitionItem[];
    validationErrors: any;
    updateItem: (id: string, field: keyof RequisitionItem, value: string | number) => void;
    saveItem: (id: string) => void;
    removeItem: (id: string) => void;
    addNewItem: () => void;
    hasError: (id: string, field: string) => boolean;
    editItem: (id: string) => void;
    // Props from Parent (RequisitionEdit)
    availableCategories: Array<{ id: number; name: string }>;
    onFetchItems: (categoryName: string) => Promise<any[]>;
}

export default function RequestedItems({
                                           items: requisitionItems,
                                           validationErrors,
                                           updateItem,
                                           saveItem,
                                           removeItem,
                                           addNewItem,
                                           hasError,
                                           editItem,
                                           availableCategories = [],
                                           onFetchItems
                                       }: RequestedItemsProps) {

    // Store options for each row: { "row_id": [List of DatabaseItems] }
    const [rowOptions, setRowOptions] = useState<Record<string, DatabaseItem[]>>({});
    const [loadingState, setLoadingState] = useState<Record<string, boolean>>({});

    // Track fetched rows to prevent infinite loops
    const fetchedRows = useRef<Set<string>>(new Set());

    // --- 1. Helper to Fetch Items from Parent ---
    const loadItemsForRow = async (rowId: string, categoryName: string) => {
        if (!categoryName || !onFetchItems) return;

        setLoadingState(prev => ({ ...prev, [rowId]: true }));
        try {
            const data = await onFetchItems(categoryName);
            setRowOptions(prev => ({ ...prev, [rowId]: data }));
        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            setLoadingState(prev => ({ ...prev, [rowId]: false }));
        }
    };

    // --- 2. Initial Load Effect (For Edit Mode) ---
    useEffect(() => {
        requisitionItems.forEach(item => {
            if (item.category && !rowOptions[item.id] && !fetchedRows.current.has(item.id)) {
                fetchedRows.current.add(item.id);
                loadItemsForRow(item.id, item.category);
            }
        });
    }, [requisitionItems, rowOptions]);

    // --- Handlers ---

    // When Category Changes
    const handleCategoryChange = (rowId: string, categoryName: string) => {
        // Update visual category
        updateItem(rowId, 'category', categoryName);

        // Reset item fields
        updateItem(rowId, 'itemName', '');
        updateItem(rowId, 'itemId', '');
        updateItem(rowId, 'unit_price', '');
        updateItem(rowId, 'total', '');

        // Fetch items for this row based on new category
        fetchedRows.current.delete(rowId); // Allow re-fetch
        loadItemsForRow(rowId, categoryName);
    };

    // When Item Selection Changes (Your Logic)
    const handleItemSelection = (rowId: string, selectedId: string) => {
        // 1. Handle "Select Item" placeholder
        if (!selectedId) {
            updateItem(rowId, 'itemId', '');
            updateItem(rowId, 'itemName', '');
            updateItem(rowId, 'unit_price', '');
            updateItem(rowId, 'total', '');
            return;
        }

        // 2. Get list of items for this row
        const availableItems = rowOptions[rowId] || [];

        // 3. Find the item object
        const selectedItem = availableItems.find(item => item.id.toString() === selectedId.toString());

        if (selectedItem) {
            updateItem(rowId, 'itemId', selectedItem.id);
            updateItem(rowId, 'itemName', selectedItem.name);
            updateItem(rowId, 'unit_price', selectedItem.unit_price);

            // Recalculate total immediately if quantity exists
            const currentItem = requisitionItems.find(i => i.id === rowId);
            if (currentItem && currentItem.quantity) {
                const total = (parseFloat(currentItem.quantity) * selectedItem.unit_price).toFixed(2);
                updateItem(rowId, 'total', total);
            }
        }
    };

    // When Quantity Changes
    const handleQuantityChange = (itemId: string, quantityValue: string) => {
        const item = requisitionItems.find(i => i.id === itemId);
        if (!item) return;

        updateItem(itemId, 'quantity', quantityValue);

        if (quantityValue && item.unit_price) {
            const quantity = parseFloat(quantityValue) || 0;
            const unitPrice = parseFloat(item.unit_price.toString()) || 0;
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
                        // Get items specifically for this row
                        const dropdownItems = rowOptions[item.id] || [];
                        const isLoading = loadingState[item.id];

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
                                            {availableCategories.map(cat => (
                                                <option key={cat.id} value={cat.name}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 2. Item Select (Dynamic based on Category) */}
                                    <div>
                                        <select
                                            // Value is the ID. Use itemId if available.
                                            value={item.itemId || ""}
                                            onChange={(e) => handleItemSelection(item.id, e.target.value)}
                                            className="w-full px-2 py-1 text-sm border rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-input border-gray-300 dark:border-sidebar-border text-gray-900 dark:text-white"
                                            required
                                            disabled={item.isSaved || !item.category || isLoading}
                                        >
                                            <option value="">
                                                {isLoading ? 'Loading items...' : (item.category ? 'Select Item Name' : 'Select category first')}
                                            </option>

                                            {dropdownItems.map(itemData => (
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

                                    {/* Total Display */}
                                    {parseFloat(item.total) > 0 && (
                                        <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Price: ₱{Number(item.unit_price).toLocaleString()} |
                                            <span className="font-bold ml-1 text-gray-900 dark:text-white">
                                                Total: ₱{Number(item.total).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
