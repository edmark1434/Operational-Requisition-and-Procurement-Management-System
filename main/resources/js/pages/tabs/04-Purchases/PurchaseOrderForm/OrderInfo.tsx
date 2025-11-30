interface OrderInfoProps {
    formData: {
        REFERENCE_NO: string;
        PAYMENT_TYPE: string;
        ORDER_TYPE?: string;
    };
    selectedSupplier: any;
    errors: { [key: string]: string };
    onInputChange: (field: string, value: any) => void;
    isEditMode: boolean;
    onOrderTypeChange?: (orderType: string) => void; // Add this prop
}

export default function OrderInfo({
                                      formData,
                                      selectedSupplier,
                                      errors,
                                      onInputChange,
                                      isEditMode,
                                      onOrderTypeChange
                                  }: OrderInfoProps) {

    const handleOrderTypeChange = (value: string) => {
        onInputChange('ORDER_TYPE', value);
        // Notify parent about order type change to filter requisitions
        if (onOrderTypeChange) {
            onOrderTypeChange(value);
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-2">
                Order Information
            </h3>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reference Number
                </label>
                <input
                    type="text"
                    readOnly
                    value={formData.REFERENCE_NO}
                    className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm bg-gray-50 dark:bg-input text-gray-400 dark:text-gray-500 font-mono cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Auto-generated reference number
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Order Type <span className="text-red-500">*</span>
                </label>
                <select
                    required
                    value={formData.ORDER_TYPE || ''}
                    onChange={(e) => handleOrderTypeChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                        errors.ORDER_TYPE ? 'border-red-500' : 'border-sidebar-border'
                    }`}
                >
                    <option value="">Select order type</option>
                    <option value="Items">Items</option>
                    <option value="Services">Services</option>
                </select>
                {errors.ORDER_TYPE && (
                    <p className="text-red-500 text-xs mt-1">{errors.ORDER_TYPE}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Select the type of purchase order
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Type <span className="text-red-500">*</span>
                </label>
                <select
                    required
                    value={formData.PAYMENT_TYPE}
                    onChange={(e) => onInputChange('PAYMENT_TYPE', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                        errors.PAYMENT_TYPE ? 'border-red-500' : 'border-sidebar-border'
                    }`}
                    disabled={!selectedSupplier}
                >
                    <option value="">Select payment type</option>
                    {selectedSupplier?.ALLOWS_CASH && <option value="cash">Cash</option>}
                    {selectedSupplier?.ALLOWS_DISBURSEMENT && <option value="disbursement">Disbursement</option>}
                    {selectedSupplier?.ALLOWS_STORE_CREDIT && <option value="store_credit">Store Credit</option>}
                </select>
                {errors.PAYMENT_TYPE && (
                    <p className="text-red-500 text-xs mt-1">{errors.PAYMENT_TYPE}</p>
                )}
                {!selectedSupplier && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Select a supplier to see available payment options
                    </p>
                )}
            </div>
        </div>
    );
}
