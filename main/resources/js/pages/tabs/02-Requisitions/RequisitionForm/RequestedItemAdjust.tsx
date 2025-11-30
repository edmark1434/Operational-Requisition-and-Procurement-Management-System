import { Edit3, Save, Check } from 'lucide-react';

// --- Interfaces ---
interface RequisitionItem {
    id: string;
    category: string;
    itemName: string;
    quantity: string;
    unit_price: string;
    total: string;
    isSaved: boolean;
    itemId?: number;
    originalItemId?: number;
    approvedQuantity?: string;
}

interface RequestedItemAdjustProps {
    items: RequisitionItem[];
    validationErrors: any;
    updateItemApprovedQuantity: (id: string, approvedQuantity: string) => void;
    hasError: (itemId: string, field: 'quantity' | 'category' | 'itemName') => boolean;
    saveItem: (id: string) => void;
    editItem: (id: string) => void;
}

export default function RequestedItemAdjust({
                                                items: requisitionItems,
                                                validationErrors,
                                                updateItemApprovedQuantity,
                                                hasError,
                                                saveItem,
                                                editItem
                                            }: RequestedItemAdjustProps) {

    // Format number with commas for pesos
    const formatPesos = (amount: string | number) => {
        const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
        return new Intl.NumberFormat('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    };

    // Calculate approved total for an item
    const calculateApprovedTotal = (item: RequisitionItem) => {
        const approvedQty = parseFloat(item.approvedQuantity || '0') || 0;
        const unitPrice = parseFloat(item.unit_price) || 0;
        return (approvedQty * unitPrice);
    };

    return (
        <div className="lg:col-span-2 flex flex-col">
            <div className="p-4 border border-gray-200 dark:border-sidebar-border rounded-lg bg-gray-50 dark:bg-sidebar flex-1">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Requested Items - Adjust Quantities ({requisitionItems.length})
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Set approved quantities for items
                    </div>
                </div>

                {validationErrors.items && (
                    <div className="mb-4 p-3 border border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-red-500 text-sm">{validationErrors.items}</p>
                    </div>
                )}

                <div className={`space-y-3 overflow-y-auto pr-2 ${requisitionItems.length > 2 ? 'max-h-96' : ''}`}>
                    {requisitionItems.map((item, index) => (
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
                                </div>
                            </div>

                            {/* Row 1: Category, Item */}
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                {/* Selected Category */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Selected Category
                                    </label>
                                    <div className="w-full px-2 py-1 text-sm border rounded shadow-sm bg-white dark:bg-input border-gray-300 dark:border-sidebar-border text-gray-500 dark:text-gray-400 min-h-[36px] flex items-center">
                                        {item.category || 'N/A'}
                                    </div>
                                </div>

                                {/* Selected Item */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Selected Item
                                    </label>
                                    <div className="w-full px-2 py-1 text-sm border rounded shadow-sm bg-white dark:bg-input border-gray-300 dark:border-sidebar-border text-gray-500 dark:text-gray-400 min-h-[36px] flex items-center">
                                        {item.itemName || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Unit Price, Requested Quantity, Approved Quantity */}
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                {/* Unit Price */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Unit Price
                                    </label>
                                    <div className="w-full px-2 py-1 text-sm border rounded shadow-sm bg-white dark:bg-input border-gray-300 dark:border-sidebar-border text-gray-500 dark:text-gray-400 text-center">
                                        ₱{formatPesos(item.unit_price || '0')}
                                    </div>
                                </div>

                                {/* Requested Quantity */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Requested Quantity
                                    </label>
                                    <div className="w-full px-2 py-1 text-sm border rounded shadow-sm bg-white dark:bg-input border-gray-300 dark:border-sidebar-border text-gray-500 dark:text-gray-400 text-center">
                                        {item.quantity || '0'}
                                    </div>
                                </div>

                                {/* Approved Quantity */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Approved Quantity *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={item.approvedQuantity || ''}
                                        onChange={(e) => updateItemApprovedQuantity(item.id, e.target.value)}
                                        className="w-full px-2 py-1 text-sm border rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-input border-gray-300 dark:border-sidebar-border text-gray-900 dark:text-white text-center"
                                        placeholder="Enter approved quantity"
                                        disabled={item.isSaved}
                                    />
                                    {hasError(item.id, 'quantity') && (
                                        <p className="text-red-500 text-xs mt-1">Please enter a valid quantity</p>
                                    )}
                                </div>
                            </div>

                            {/* Row 3: Unit Price, Requested Total, Approved Total */}
                            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200 dark:border-gray-600">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Unit Price
                                    </label>
                                    <div className="w-full px-2 py-1 text-sm border rounded shadow-sm bg-white dark:bg-input border-gray-300 dark:border-sidebar-border text-gray-500 dark:text-gray-400 text-center">
                                        ₱{formatPesos(item.unit_price || '0')}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Requested Total
                                    </label>
                                    <div className="w-full px-2 py-1 text-sm border rounded shadow-sm bg-white dark:bg-input border-gray-300 dark:border-sidebar-border text-gray-500 dark:text-gray-400 text-center">
                                        ₱{formatPesos(item.total || '0')}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Approved Total
                                    </label>
                                    <div className="w-full px-2 py-1 text-sm border rounded shadow-sm bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-300 text-center font-semibold">
                                        ₱{formatPesos(calculateApprovedTotal(item))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary Information */}
                <div className="mt-4 p-3 border border-gray-200 dark:border-sidebar-border rounded-lg bg-white dark:bg-sidebar-accent">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Total Items: </span>
                            <span className="text-gray-500 dark:text-gray-400">{requisitionItems.length}</span>
                        </div>
                        <div className="text-center">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Original Total: </span>
                            <span className="text-gray-500 dark:text-gray-400">
                                ₱{formatPesos(requisitionItems.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0))}
                            </span>
                        </div>
                        <div className="text-center">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Approved Total: </span>
                            <span className="text-green-600 dark:text-green-400 font-semibold">
                                ₱{formatPesos(requisitionItems.reduce((sum, item) => sum + calculateApprovedTotal(item), 0))}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
