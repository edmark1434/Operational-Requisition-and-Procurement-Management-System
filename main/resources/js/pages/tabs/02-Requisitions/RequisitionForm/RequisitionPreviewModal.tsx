// RequisitionPreviewModal.tsx
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

    const isServiceRequisition = formData?.type === 'services';
    const itemsCount = formData?.items?.length || 0;
    const servicesCount = formData?.services?.length || 0;
    const totalItems = isServiceRequisition ? servicesCount : itemsCount;

    // Helper to format currency (PHP) for items only
    const formatCurrencyDisplay = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Helper to format USD rate
    const formatHourlyRate = (rate: number | string) => {
        const value = parseFloat(rate.toString() || "0");
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(value) + " / hr";
    };


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
                                    Type
                                </label>
                                <p className="text-sm text-gray-900 dark:text-white capitalize">{formData?.type}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Total {isServiceRequisition ? 'Jobs' : 'Items'}
                                </label>
                                <p className="text-sm text-gray-900 dark:text-white">{totalItems}</p>
                            </div>

                            {/* Total Amount Summary - HIDDEN FOR SERVICES */}
                            {!isServiceRequisition && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Total Amount
                                    </label>
                                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                        {formatCurrencyDisplay(formData?.total_amount || 0)}
                                    </p>
                                </div>
                            )}

                            {/* Service Status Indicator (No longer needed) */}
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

                    {/* Items/Services List - TABLE LAYOUT */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Requested {isServiceRequisition ? 'Services' : 'Items'} ({totalItems})
                        </label>
                        <div className="border border-sidebar-border rounded-lg overflow-hidden bg-white dark:bg-sidebar-accent">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-sidebar border-b border-sidebar-border">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                                        #
                                    </th>
                                    {!isServiceRequisition && (
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                                            Quantity
                                        </th>
                                    )}
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {isServiceRequisition ? 'Job/Service Details' : 'Item Name'}
                                    </th>

                                    {/* Conditional Columns */}
                                    {isServiceRequisition ? (
                                        // Services Header Columns
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">Hourly Rate</th>
                                    ) : (
                                        // Items Header Columns
                                        <>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">Unit Price</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">Total</th>
                                        </>
                                    )}
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border">
                                {isServiceRequisition ? (
                                    // Services Table (New Structure: Qty | Details | Hourly Rate)
                                    formData?.services?.map((service: any, index: number) => (
                                        <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-sidebar">
                                            <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                                                <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 dark:bg-sidebar border border-sidebar-border rounded text-xs">
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {service.serviceName}
                                                    </div>
                                                    {service.description && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {service.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm font-medium text-purple-600 dark:text-purple-400">
                                                {formatHourlyRate(service.hourlyRate || service.unit_price)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    // Items Table (Unchanged)
                                    formData?.items?.map((item: any, index: number) => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-sidebar">
                                            <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                                                <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 dark:bg-sidebar border border-sidebar-border rounded text-xs">
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm font-bold text-blue-600 dark:text-blue-400">
                                                {item.quantity}
                                            </td>
                                            <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                                                {item.itemName}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-sidebar border border-sidebar-border">
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                                ${item.unit_price || '0.00'}
                                            </td>
                                            <td className="py-3 px-4 text-sm font-bold text-green-600 dark:text-green-400">
                                                ${item.total || '0.00'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                                {/* Total Row - HIDDEN FOR SERVICES */}
                                {!isServiceRequisition && (
                                    <tfoot className="bg-gray-50 dark:bg-sidebar border-t border-sidebar-border">
                                    <tr>
                                        <td colSpan={5} className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white text-right">
                                            Grand Total:
                                        </td>
                                        <td className="py-3 px-4 text-lg font-bold text-green-600 dark:text-green-400">
                                            {formatCurrencyDisplay(formData?.total_amount || 0)}
                                        </td>
                                    </tr>
                                    </tfoot>
                                )}
                            </table>
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
