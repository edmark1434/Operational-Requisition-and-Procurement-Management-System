interface RequisitionDetailsProps {
    priority: string;
    setPriority: (priority: string) => void;
    type: string;
    setType: (type: string) => void;
    notes: string;
    setNotes: (notes: string) => void;
    totalAmount: number; // <--- This receives the calculated total from parent
    disabled?: boolean;
}

export default function RequisitionDetails({
                                               priority,
                                               setPriority,
                                               type,
                                               setType,
                                               notes,
                                               setNotes,
                                               totalAmount = 0, // Default to 0
                                               disabled = false
                                           }: RequisitionDetailsProps) {

    // Helper to format currency (PHP)
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className="p-4 border border-gray-200 dark:border-sidebar-border rounded-lg bg-gray-50 dark:bg-sidebar">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Requisition Details
            </h3>

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Priority
                        </label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            disabled={disabled}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-sidebar-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-sidebar-accent text-gray-900 dark:text-white"
                        >
                            <option value="Low">Low</option>
                            <option value="Normal">Normal</option>
                            <option value="High">High</option>
                        </select>
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Type
                        </label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            disabled={disabled}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-sidebar-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-sidebar-accent text-gray-900 dark:text-white"
                        >
                            <option value="items">Items</option>
                            <option value="services">Services</option>
                        </select>
                    </div>
                </div>

                {/* Grand Total Display - AUTOMATICALLY UPDATED */}
                <div>
                    <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                        Grand Total Cost
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            readOnly
                            value={formatCurrency(totalAmount)}
                            className="w-full px-3 py-3 text-lg font-bold text-green-600 border border-gray-300 dark:border-sidebar-border rounded-lg bg-gray-100 dark:bg-sidebar-accent cursor-not-allowed"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Calculated automatically based on Item Price × Quantity.
                    </p>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        disabled={disabled}
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-sidebar-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-sidebar-accent text-gray-900 dark:text-white"
                        placeholder="Additional notes or comments..."
                    />
                </div>
            </div>
        </div>
    );
}
