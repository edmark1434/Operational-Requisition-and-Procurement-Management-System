interface PreviewModalProps {
    formData: any;
    selectedSupplier: any;
    selectedRequisition: any;
    selectedItems: any[];
    totalCost: number;
    onConfirm: () => void;
    onCancel: () => void;
    isEditMode: boolean;
}

export default function PreviewModal({
                                         formData,
                                         selectedSupplier,
                                         selectedRequisition,
                                         selectedItems,
                                         totalCost,
                                         onConfirm,
                                         onCancel,
                                         isEditMode
                                     }: PreviewModalProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return 'Invalid Date';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-sidebar rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-sidebar-border">
                {/* Header */}
                <div className="flex-shrink-0 p-6 border-b border-sidebar-border bg-white dark:bg-sidebar sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Purchase Order Preview
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Review your purchase order before {isEditMode ? 'updating' : 'creating'}
                            </p>
                        </div>
                        <button
                            onClick={onCancel}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Order Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Reference Number
                                </label>
                                <p className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                                    {formData.REFERENCE_NO}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Payment Type
                                </label>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    {formData.PAYMENT_TYPE?.charAt(0).toUpperCase() + formData.PAYMENT_TYPE?.slice(1)}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Total Amount
                                </label>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {formatCurrency(totalCost)}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Items Count
                                </label>
                                <p className="text-sm text-gray-900 dark:text-white font-medium">
                                    {selectedItems.length} items
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Supplier Information */}
                    <div className="border-t border-sidebar-border pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Supplier Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Supplier Name
                                </label>
                                <p className="text-sm text-gray-900 dark:text-white font-medium">
                                    {selectedSupplier?.NAME}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {selectedSupplier?.EMAIL}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedSupplier?.CONTACT_NUMBER}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Payment Methods
                                </label>
                                <div className="flex flex-wrap gap-1">
                                    {selectedSupplier?.ALLOWS_CASH && (
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                            Cash
                                        </span>
                                    )}
                                    {selectedSupplier?.ALLOWS_DISBURSEMENT && (
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            Disbursement
                                        </span>
                                    )}
                                    {selectedSupplier?.ALLOWS_STORE_CREDIT && (
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                            Store Credit
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Requisition Information */}
                    <div className="border-t border-sidebar-border pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Requisition Information
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Requestor:</span>
                                <p className="font-medium">{selectedRequisition?.REQUESTOR}</p>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Priority:</span>
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                    selectedRequisition?.PRIORITY === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                        selectedRequisition?.PRIORITY === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                }`}>
                                    {selectedRequisition?.PRIORITY}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Date:</span>
                                <p>{formatDate(selectedRequisition?.CREATED_AT)}</p>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Items:</span>
                                <p>{selectedRequisition?.ITEMS.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="border-t border-sidebar-border pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Order Items ({selectedItems.length})
                        </h3>
                        <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border">
                            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-100 dark:bg-sidebar border-b border-sidebar-border text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                <div className="col-span-6">Item</div>
                                <div className="col-span-2 text-right">Quantity</div>
                                <div className="col-span-2 text-right">Unit Price</div>
                                <div className="col-span-2 text-right">Total</div>
                            </div>
                            <div className="divide-y divide-sidebar-border">
                                {selectedItems.map((item) => (
                                    <div key={item.ID} className="grid grid-cols-12 gap-4 px-4 py-3">
                                        <div className="col-span-6">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {item.NAME}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {item.CATEGORY}
                                            </p>
                                        </div>
                                        <div className="col-span-2 text-right">
                                            <p className="text-sm text-gray-900 dark:text-white font-medium">
                                                {item.QUANTITY}
                                            </p>
                                        </div>
                                        <div className="col-span-2 text-right">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {formatCurrency(item.UNIT_PRICE)}
                                            </p>
                                        </div>
                                        <div className="col-span-2 text-right">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(item.QUANTITY * item.UNIT_PRICE)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Total Row */}
                            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-sidebar border-t border-sidebar-border">
                                <div className="col-span-8"></div>
                                <div className="col-span-4 text-right">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Grand Total:</p>
                                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                        {formatCurrency(totalCost)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Remarks */}
                    {formData.REMARKS && (
                        <div className="border-t border-sidebar-border pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Remarks
                            </h3>
                            <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-sidebar-accent p-3 rounded-lg">
                                {formData.REMARKS}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 p-6 border-t border-sidebar-border bg-gray-50 dark:bg-sidebar-accent">
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                        >
                            Go Back & Edit
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                        >
                            {isEditMode ? 'Confirm Update' : 'Confirm & Create Purchase Order'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
