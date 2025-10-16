interface RequisitionPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    formData: any;
}

export default function RequisitionPreviewModal({
                                                    isOpen,
                                                    onClose,
                                                    onConfirm,
                                                    formData
                                                }: RequisitionPreviewModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-sidebar rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-sidebar-border">
                {/* Header */}
                <div className="p-6 border-b border-sidebar-border bg-white dark:bg-sidebar">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Requisition Preview
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Please review your requisition before submitting
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 bg-white dark:bg-sidebar">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Requestor
                                </label>
                                <p className="text-sm text-gray-900 dark:text-white">{formData?.requestor}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Priority
                                </label>
                                <p className="text-sm text-gray-900 dark:text-white capitalize">{formData?.priority}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Total Items
                                </label>
                                <p className="text-sm text-gray-900 dark:text-white">{formData?.items?.length || 0}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Total Amount
                                </label>
                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    ${formData?.total_amount?.toLocaleString() || '0'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {formData?.notes && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Notes
                            </label>
                            <div className="text-sm text-gray-900 dark:text-gray-300 bg-gray-50 dark:bg-sidebar-accent p-4 rounded-lg border border-sidebar-border">
                                {formData.notes}
                            </div>
                        </div>
                    )}

                    {/* Items List */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Requested Items ({formData?.items?.length || 0})
                        </label>
                        <div className="space-y-3">
                            {formData?.items?.map((item: any, index: number) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-4 border border-sidebar-border rounded-lg bg-white dark:bg-sidebar-accent"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-start gap-3">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-sidebar px-2 py-1 rounded border border-sidebar-border">
                                                {(formData?.items?.length || 0) - index}
                                            </span>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {item.description}
                                                </p>
                                                <div className="flex gap-4 mt-1">
                                                    <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-sidebar px-2 py-1 rounded border border-sidebar-border">
                                                        {item.category}
                                                    </span>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                        Quantity: {item.quantity}
                                                    </p>
                                                    {item.unit_price && (
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                                            Unit Price: ${parseFloat(item.unit_price).toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                            ${(parseFloat(item.total) || 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer with Actions */}
                <div className="p-6 border-t border-sidebar-border bg-gray-50 dark:bg-sidebar-accent">
                    <div className="flex justify-between items-center">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                        >
                            Back to Edit
                        </button>
                        <div className="flex gap-3">
                            <button
                                onClick={onConfirm}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                            >
                                Confirm & Submit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
