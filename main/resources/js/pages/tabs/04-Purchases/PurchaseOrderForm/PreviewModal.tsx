import {Requisition, RequisitionItem, RequisitionService, Vendor} from "@/pages/tabs/04-Purchases/PurchaseOrderForm";

interface PreviewModalProps {
    formData: any;
    selectedSupplier: Vendor | null;
    selectedRequisition: Requisition[];
    selectedItems: RequisitionItem[];
    selectedServices: RequisitionService[];
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
                                         selectedServices,
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

    // Safe access to requisition data
    const getRequisitionData: {
        REQUESTOR: string,
        PRIORITY: string,
        CREATED_AT: string,
        ITEMS: RequisitionItem[]
    } = () => {
        if (!selectedRequisition || selectedRequisition.length === 0) {
            return {
                REQUESTOR: 'N/A',
                PRIORITY: 'Normal',
                CREATED_AT: new Date().toISOString(),
                ITEMS: []
            };
        }

        // For multiple requisitions, show summary
        if (selectedRequisition.length > 0) {
            return {
                REQUESTOR: `${selectedRequisition.length} Requisitions`,
                PRIORITY: 'Multiple',
                CREATED_AT: selectedRequisition[0]?.created_at || new Date().toISOString(),
                ITEMS: selectedRequisition.flatMap(req => selectedItems.filter(i => i.req_id === req.id) || [])
            };
        }
    };

    const requisitionData = getRequisitionData();

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
                            {selectedRequisition && selectedRequisition.length > 1 && (
                                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                        Merging {selectedRequisition.length} requisitions
                                    </p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={onCancel}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent transition-colors"
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
                                <p className="text-sm font-mono font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded border">
                                    {formData.REFERENCE_NO}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Payment Type
                                </label>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
                                    {formData.PAYMENT_TYPE}
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
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
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
                            <div className="space-y-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Supplier Name
                                    </label>
                                    <p className="text-base font-medium text-gray-900 dark:text-white">
                                        {selectedSupplier?.name}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Contact Information
                                    </label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {selectedSupplier?.email}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {selectedSupplier?.contact_number ?? 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Accepted Payment Methods
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedSupplier?.allows_cash && (
                                        <span className="inline-flex items-center px-3 py-1 rounded text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                            Cash
                                        </span>
                                    )}
                                    {selectedSupplier?.allows_disbursement && (
                                        <span className="inline-flex items-center px-3 py-1 rounded text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            Disbursement
                                        </span>
                                    )}
                                    {selectedSupplier?.allows_store_credit && (
                                        <span className="inline-flex items-center px-3 py-1 rounded text-sm bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
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
                                <p className="font-medium text-gray-900 dark:text-white mt-1">{requisitionData.REQUESTOR}</p>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Priority:</span>
                                <div className="mt-1">
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                        requisitionData.PRIORITY === 'Urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                            requisitionData.PRIORITY === 'High' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                    }`}>
                                        {requisitionData.PRIORITY}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Date:</span>
                                <p className="font-medium text-gray-900 dark:text-white mt-1">{formatDate(requisitionData.CREATED_AT)}</p>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Items:</span>
                                <p className="font-medium text-gray-900 dark:text-white mt-1">{requisitionData.ITEMS.length}</p>
                            </div>
                        </div>

                        {/* Multiple requisitions summary */}
                        {selectedRequisition && selectedRequisition.length > 1 && (
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Merged Requisitions:
                                </p>
                                <div className="space-y-2">
                                    {selectedRequisition.map((req, index) => (
                                        <div key={req.ID} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Requisition #{req.ID} - {req.REQUESTOR}
                                            </span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {req.ITEMS?.length || 0} items
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Items List */}
                    <div className="border-t border-sidebar-border pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Order Items ({selectedItems.length})
                        </h3>
                        <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border shadow-sm">
                            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-sidebar-accent border-b border-sidebar-border text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                <div className="col-span-6">Item Details</div>
                                <div className="col-span-2 text-right">Quantity</div>
                                <div className="col-span-2 text-right">Unit Price</div>
                                <div className="col-span-2 text-right">Total</div>
                            </div>
                            <div className="divide-y divide-sidebar-border">
                                {selectedItems.map((item) => (
                                    <div key={item.ID} className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-sidebar-accent transition-colors">
                                        <div className="col-span-6">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {item.NAME}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {item.CATEGORY}
                                            </p>
                                        </div>
                                        <div className="col-span-2 text-right">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
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
                            <div className="grid grid-cols-12 gap-4 px-4 py-4 bg-gray-50 dark:bg-sidebar-accent border-t border-sidebar-border">
                                <div className="col-span-8"></div>
                                <div className="col-span-4 text-right">
                                    <p className="text-base font-medium text-gray-700 dark:text-gray-300">Grand Total:</p>
                                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
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
                            <div className="bg-gray-50 dark:bg-sidebar-accent p-4 rounded-lg border">
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {formData.REMARKS}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 p-6 border-t border-sidebar-border bg-gray-50 dark:bg-sidebar-accent">
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onCancel}
                            className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent transition-colors"
                        >
                            Back to Edit
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            {isEditMode ? 'Update Purchase Order' : 'Create Purchase Order'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
