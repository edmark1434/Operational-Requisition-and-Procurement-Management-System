import {Category, Requisition, RequisitionItem, RequisitionService} from "@/pages/tabs/04-Purchases/PurchaseOrderForm";

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
}

export default function OrderItems({
                                       formData,
                                       selectedRequisition,
                                       originalQuantities,
                                       errors,
                                       onToggleItemSelection,
                                       onUpdateItemQuantity,
                                       requisitionItems,
                                       categories
                                   }: OrderItemsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const getSelectedItems = () => {
        return formData.ITEMS;
    };

    const calculateSubtotal = () => {
        return formData.ITEMS
            .reduce((total: number, item: any) => total + (item.quantity * item.item.unit_price), 0);
    };

    const calculateTotalItems = () => {
        return formData.ITEMS
            .reduce((total: number, item: any) => total + item.quantity, 0);
    };

    if (!selectedRequisition) {
        return null;
    }

    const selectedItems = getSelectedItems();
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
                    {selectedItems.length} of {requisitionItems.filter(ri => selectedRequisition.map(r => r.id).includes(ri.req_id)).length} item{requisitionItems.filter(ri => selectedRequisition.map(r => r.id).includes(ri.req_id)).length > 1 ? 's' : ''} selected • {totalItems} total quantity
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
                    {requisitionItems.filter(ri => selectedRequisition.map(r => r.id).includes(ri.req_id)).map((item) => {
                        const originalQty = originalQuantities[item.id] || item.quantity;
                        const isIncreased = formData.ITEMS.find(i => i.id === item.id)?.quantity > originalQty;
                        const itemTotal = (reqItemtoFormItem(item).quantity || item.quantity) * item.item.unit_price;

                        return (
                            <div
                                key={item.id}
                                className={`grid grid-cols-12 gap-4 px-4 py-3 items-center transition-colors ${
                                    formData.ITEMS.some(i => i.id === item.id)
                                        ? 'bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20'
                                        : 'hover:bg-gray-50 dark:hover:bg-sidebar'
                                }`}
                            >
                                {/* Select Checkbox */}
                                <div className="col-span-1">
                                    <input
                                        type="checkbox"
                                        checked={formData.ITEMS.some(i => i.id === item.id) || false}
                                        onChange={() => onToggleItemSelection(item.id)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </div>

                                {/* Item Details */}
                                <div className="col-span-4">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {item.item.name}
                                    </p>
                                    {isIncreased && (
                                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                            ⚠️ Increased from {originalQty}
                                        </p>
                                    )}
                                </div>

                                {/* Category */}
                                <div className="col-span-1 text-center">
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-sidebar text-gray-600 dark:text-gray-400">
                                        {categories.find(c => c.id === item.item.category_id)?.name || 'N/A'}
                                    </span>
                                </div>

                                {/* Unit Price */}
                                <div className="col-span-2 text-right">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {formatCurrency(item.item.unit_price)}
                                    </p>
                                </div>

                                {/* Quantity Controls */}
                                <div className="col-span-2">
                                    <div className="flex items-center justify-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => onUpdateItemQuantity(item.id, reqItemtoFormItem(item).quantity - 1)}
                                            disabled={reqItemtoFormItem(item).quantity <= originalQty}
                                            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            title={item.quantity <= originalQty ? "Cannot decrease below requisition quantity" : "Decrease quantity"}
                                        >
                                            -
                                        </button>
                                        <div className="text-center min-w-12">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {reqItemtoFormItem(item).quantity || item.quantity}
                                            </span>
                                            {isIncreased && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    was {originalQty}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => onUpdateItemQuantity(item.id, reqItemtoFormItem(item).quantity + 1)}
                                            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                                            title="Increase quantity"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Item Total */}
                                <div className="col-span-2 text-right">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(itemTotal)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {reqItemtoFormItem(item).quantity || item.quantity} × {formatCurrency(item.item.unit_price)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary Section */}
                {selectedItems.length > 0 && (
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
                                        <span className="font-medium">{selectedItems.length}</span> item{selectedItems.length > 1 ? 's' : ''} selected •
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
