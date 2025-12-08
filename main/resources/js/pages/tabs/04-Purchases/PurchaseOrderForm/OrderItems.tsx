import {
    Category,
    Requisition,
    RequisitionItem,
    RequisitionOrderItem,
    RequisitionService
} from "@/pages/tabs/04-Purchases/PurchaseOrderForm";
import { GroupedItem, groupRequisitionItems } from "@/pages/tabs/04-Purchases/utils/groupedItems";


interface OrderItemsProps {
    formData: {
        ITEMS: any[];
    };
    selectedRequisition: Requisition[];
    originalQuantities: { [key: number]: number };
    errors: { [key: string]: string };
    onToggleItemSelection: (itemId: number) => void;
    onUpdateItemQuantity: (itemId: number, quantity: number) => void;
    requisitionItems: RequisitionItem[];
    categories: Category[];
    requisitionOrderItems: RequisitionOrderItem[];
    form: {
        ITEMS: any[];
    };
}

export default function OrderItems({
                                       formData,
                                       selectedRequisition,
                                       originalQuantities,
                                       errors,
                                       onToggleItemSelection,
                                       onUpdateItemQuantity,
                                       requisitionItems,
                                       categories,
                                       requisitionOrderItems,
                                       form
                                   }: OrderItemsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const availableReqItems = requisitionItems.filter(ri =>
        selectedRequisition.map(r => r.id).includes(ri.req_id)
    );

    // Group them for display
    const groupedItems = groupRequisitionItems(availableReqItems, requisitionOrderItems);

    // Build lookup: item_id → hasOrderedVersion?
    const hasOrderedVersion = groupedItems.reduce((acc, g) => {
        if (g.isOrdered) acc[g.item_id] = true;
        return acc;
    }, {} as Record<number, boolean>);

    // Check if a grouped item is fully selected
    const isGroupedItemSelected = (groupedItem: GroupedItem) => {
        return groupedItem.reqItems.every(reqItem =>
            formData.ITEMS.some(i => i.id === reqItem.id)
        );
    };

    // Toggle all reqItems in a group
    const handleToggleGroupedItem = (groupedItem: GroupedItem) => {
        const allSelected = isGroupedItemSelected(groupedItem);

        if (allSelected) {
            // Remove all reqItems in this group
            groupedItem.reqItems.forEach(reqItem => {
                onToggleItemSelection(reqItem.id);
            });
        } else {
            // Add all reqItems in this group
            groupedItem.reqItems.forEach(reqItem => {
                if (!formData.ITEMS.some(i => i.id === reqItem.id)) {
                    onToggleItemSelection(reqItem.id);
                }
            });
        }
    };

    // Calculate the total quantity for a grouped item (from formData)
    const getGroupedItemQuantity = (groupedItem: GroupedItem) => {
        return groupedItem.reqItems.reduce((sum, reqItem) => {
            const formItem = formData.ITEMS.find(i => i.id === reqItem.id);
            return sum + (formItem?.quantity || 0);
        }, 0);
    };

    // Update quantity proportionally across all reqItems in group
    const handleUpdateGroupedQuantity = (groupedItem: GroupedItem, newTotal: number) => {
        const currentTotal = getGroupedItemQuantity(groupedItem);
        const originalTotal = groupedItem.total_quantity;

        // Prevent going below original total
        if (newTotal < originalTotal) return;

        // Distribute the change proportionally
        const delta = newTotal - currentTotal;
        const distribution = Math.floor(delta / groupedItem.reqItems.length);
        const remainder = delta % groupedItem.reqItems.length;

        groupedItem.reqItems.forEach((reqItem, index) => {
            const formItem = formData.ITEMS.find(i => i.id === reqItem.id);
            if (formItem) {
                const additionalQty = distribution + (index < remainder ? 1 : 0);
                onUpdateItemQuantity(reqItem.id, formItem.quantity + additionalQty);
            }
        });
    };


    const calculateSubtotal = () => {
        return formData.ITEMS
            .reduce((total: number, item: any) => total + (item.quantity * item.item.unit_price), 0);
    };

    const calculateTotalItems = () => {
        return groupedItems
            .filter(gi => isGroupedItemSelected(gi))
            .reduce((total: number, groupedItem: GroupedItem) => {
                return total + getGroupedItemQuantity(groupedItem);
            }, 0);
    };

    if (!selectedRequisition) {
        return null;
    }

    const subtotal = calculateSubtotal();
    const totalItems = calculateTotalItems();

    const reqItemtoFormItem = (reqItem: RequisitionItem) => {
        return formData.ITEMS.find(item => item.id === reqItem.id) || {}
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Order Items
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    {groupedItems.filter(gi => isGroupedItemSelected(gi)).length} of {groupedItems.length} item{groupedItems.length > 1 ? 's' : ''} selected • {totalItems} total quantity
                </div>
            </div>

            {errors.ITEMS && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-600 dark:text-red-400 text-sm">{errors.ITEMS}</p>
                </div>
            )}

            {/* Items Table */}
            <div className="bg-white dark:bg-sidebar-accent rounded-lg border border-sidebar-border overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-sidebar border-b border-sidebar-border">
                    <div className="col-span-1 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">

                    </div>
                    <div className="col-span-4 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Item Name
                    </div>
                    <div className="col-span-1 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center">
                        Category
                    </div>
                    <div className="col-span-2 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider text-right">
                        Unit Price
                    </div>
                    <div className="col-span-2 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center">
                        Quantity
                    </div>
                    <div className="col-span-2 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider text-right">
                        Total
                    </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-sidebar-border max-h-96 overflow-y-auto">
                    {groupedItems.map((groupedItem) => {
                        const isSelected = isGroupedItemSelected(groupedItem);
                        const currentQty = getGroupedItemQuantity(groupedItem);
                        const isIncreased = currentQty > groupedItem.total_quantity;
                        const itemTotal = (isSelected ? currentQty : groupedItem.total_quantity) * groupedItem.unit_price;
                        const isAlreadyOrdered = groupedItem.reqItems.some(reqItem =>
                            requisitionOrderItems.some(i => i.req_item_id === reqItem.id)
                        );

                        return (
                            <div
                                key={`grouped-${groupedItem.item_id}-${groupedItem.isOrdered ? 'ordered' : 'not'}`}
                                className={`grid grid-cols-12 gap-4 px-4 py-3 items-center transition-colors
                                ${(isAlreadyOrdered && !form.ITEMS.some(i => i.item.id === groupedItem.item_id))
                                    ? 'opacity-50 bg-neutral-100 dark:bg-neutral-900 pointer-events-none'
                                    : isSelected
                                        ? 'bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100'
                                        : 'hover:bg-gray-50 dark:hover:bg-sidebar'
                                }`}
                            >
                                {/* Checkbox */}
                                <div className="col-span-1">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleToggleGroupedItem(groupedItem)}
                                        disabled={isAlreadyOrdered && !form.ITEMS.some(i => i.item.id === groupedItem.item_id)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </div>

                                {/* Item Name */}
                                <div className="col-span-4">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {groupedItem.item.name}
                                    </p>
                                    {groupedItem.reqItems.length > 1 && (
                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                            📦 Merged from {groupedItem.reqItems.length} requisitions
                                        </p>
                                    )}
                                    {isIncreased && (
                                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                            ⚠️ Increased from {groupedItem.total_quantity}
                                        </p>
                                    )}
                                    {!groupedItem.isOrdered && hasOrderedVersion[groupedItem.item_id] && (
                                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                            🔶 Not yet ordered
                                        </p>
                                    )}
                                </div>

                                {/* Category */}
                                <div className="col-span-1 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-sidebar text-gray-600 dark:text-gray-400">
                    {categories.find(c => c.id === groupedItem.categoryId)?.name || 'N/A'}
                  </span>
                                </div>

                                {/* Unit Price */}
                                <div className="col-span-2 text-right">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {formatCurrency(groupedItem.unit_price)}
                                    </p>
                                </div>

                                {/* Quantity Controls */}
                                <div className="col-span-2">
                                    <div className="flex items-center justify-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateGroupedQuantity(groupedItem, currentQty - 1)}
                                            disabled={!isSelected || currentQty <= groupedItem.total_quantity}
                                            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            -
                                        </button>
                                        <div className="text-center min-w-12">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {isSelected ? currentQty : groupedItem.total_quantity}
                      </span>
                                            {isIncreased && (
                                                <div className="text-xs text-gray-500">
                                                    was {groupedItem.total_quantity}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateGroupedQuantity(groupedItem, currentQty + 1)}
                                            disabled={!isSelected}
                                            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="col-span-2 text-right">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(itemTotal)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {isSelected ? currentQty : groupedItem.total_quantity} × {formatCurrency(groupedItem.unit_price)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary Section */}
                {groupedItems.filter(gi => isGroupedItemSelected(gi)).length > 0 && (
                    <>
                        {/* Grand Total Row */}
                        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-green-50 dark:bg-green-900/20 border-t border-sidebar-border">
                            <div className="col-span-8 text-right">
                                <p className="text-lg font-bold text-gray-900 dark:text-white">Grand Total:</p>
                            </div>
                            <div className="col-span-4 text-right">
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {formatCurrency(subtotal)}
                                </p>
                            </div>
                        </div>
                        {/* Summary Breakdown */}
                        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-sidebar border-t border-sidebar-border">
                            <div className="col-span-12">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="text-gray-600 dark:text-gray-400">
                                        <span className="font-medium">{groupedItems.filter(gi => isGroupedItemSelected(gi)).length}</span> item{groupedItems.filter(gi => isGroupedItemSelected(gi)).length > 1 ? 's' : ''} selected •
                                        <span className="font-medium"> {totalItems}</span> total quantity
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Empty State */}
                {requisitionItems.filter(ri => selectedRequisition.map(r => r.id).includes(ri.req_id)).length === 0 && (
                    <div className="px-4 py-8 text-center">
                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1M9 7h6" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            No items available. Select a requisition first.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
