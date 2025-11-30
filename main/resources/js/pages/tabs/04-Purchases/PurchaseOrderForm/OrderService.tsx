import {Category, Requisition, RequisitionItem, RequisitionService} from "@/pages/tabs/04-Purchases/PurchaseOrderForm";

interface OrderServiceProps {
    formData: {
        SERVICES: any[];
    };
    selectedRequisition: Requisition[];
    originalQuantities: { [key: number]: number };
    errors: { [key: string]: string };
    onToggleServiceSelection: (serviceId: number) => void;
    requisitionServices: RequisitionService[];
    categories: Category[];
}

export default function OrderService({
                                         formData,
                                         selectedRequisition,
                                         originalQuantities,
                                         errors,
                                         onToggleServiceSelection,
                                         requisitionServices,
                                         categories
                                     }: OrderServiceProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const getSelectedServices = () => {
        return formData.SERVICES.filter((service: any) => service.SELECTED);
    };

    const calculateSubtotal = () => {
        return formData.SERVICES
            .filter((service: any) => service.SELECTED)
            .reduce((total: number, service: any) => total + (service.QUANTITY * service.UNIT_PRICE), 0);
    };

    const calculateTotalHours = () => {
        return formData.SERVICES
            .filter((service: any) => service.SELECTED)
            .reduce((total: number, service: any) => total + service.QUANTITY, 0);
    };

    if (!selectedRequisition) {
        return null;
    }

    const selectedServices = getSelectedServices();
    const subtotal = calculateSubtotal();
    const totalHours = calculateTotalHours();

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Order Services
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedServices.length} of {formData.SERVICES.length} services selected • {totalHours} total hours
                </div>
            </div>

            {errors.SERVICES && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-600 dark:text-red-400 text-sm">{errors.SERVICES}</p>
                </div>
            )}

            {/* Services Table */}
            <div className="bg-white dark:bg-sidebar-accent rounded-lg border border-sidebar-border overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-sidebar border-b border-sidebar-border">
                    <div className="col-span-1 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Select
                    </div>
                    <div className="col-span-4 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Service Details
                    </div>
                    <div className="col-span-1 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center">
                        Type
                    </div>
                    <div className="col-span-2 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider text-right">
                        Hourly Rate
                    </div>
                    <div className="col-span-2 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center">
                        Hours
                    </div>
                    <div className="col-span-2 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider text-right">
                        Total
                    </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-sidebar-border max-h-96 overflow-y-auto">
                    {formData.SERVICES.map((service) => {
                        const originalQty = originalQuantities[service.ID] || service.QUANTITY;
                        const isIncreased = service.QUANTITY > originalQty;
                        const serviceTotal = service.QUANTITY * service.UNIT_PRICE;

                        return (
                            <div
                                key={service.ID}
                                className={`grid grid-cols-12 gap-4 px-4 py-3 items-center transition-colors ${
                                    service.SELECTED
                                        ? 'bg-purple-50 dark:bg-purple-900/10 hover:bg-purple-100 dark:hover:bg-purple-900/20'
                                        : 'hover:bg-gray-50 dark:hover:bg-sidebar'
                                }`}
                            >
                                {/* Select Checkbox */}
                                <div className="col-span-1">
                                    <input
                                        type="checkbox"
                                        checked={service.SELECTED || false}
                                        onChange={() => onToggleServiceSelection(service.ID)}
                                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                    />
                                </div>

                                {/* Service Details */}
                                <div className="col-span-4">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {service.NAME}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {service.DESCRIPTION}
                                    </p>
                                    {isIncreased && (
                                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                            ⚠️ Increased from {originalQty} hours
                                        </p>
                                    )}
                                </div>

                                {/* Service Type */}
                                <div className="col-span-1 text-center">
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                                        Service
                                    </span>
                                </div>

                                {/* Hourly Rate */}
                                <div className="col-span-2 text-right">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {formatCurrency(service.UNIT_PRICE)}/hr
                                    </p>
                                </div>

                                {/* Service Total */}
                                <div className="col-span-2 text-right">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(serviceTotal)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {service.QUANTITY} hrs × {formatCurrency(service.UNIT_PRICE)}/hr
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary Section */}
                {selectedServices.length > 0 && (
                    <>
                        {/* Subtotal Row */}
                        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-sidebar border-t border-sidebar-border">
                            <div className="col-span-8 text-right">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Subtotal ({selectedServices.length} services):</p>
                            </div>
                            <div className="col-span-4 text-right">
                                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                    {formatCurrency(subtotal)}
                                </p>
                            </div>
                        </div>

                        {/*/!* Tax Row (if applicable) *!/*/}
                        {/*<div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-sidebar border-t border-sidebar-border">*/}
                        {/*    <div className="col-span-8 text-right">*/}
                        {/*        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Tax (0%):</p>*/}
                        {/*    </div>*/}
                        {/*    <div className="col-span-4 text-right">*/}
                        {/*        <p className="text-sm text-gray-600 dark:text-gray-400">*/}
                        {/*            {formatCurrency(0)}*/}
                        {/*        </p>*/}
                        {/*    </div>*/}
                        {/*</div>*/}

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
                                        <span className="font-medium">{selectedServices.length}</span> services selected •
                                        <span className="font-medium"> {totalHours}</span> total hours
                                    </div>
                                    <div className="text-gray-600 dark:text-gray-400">
                                        Average per service: {formatCurrency(selectedServices.length > 0 ? subtotal / selectedServices.length : 0)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Empty State */}
                {requisitionServices.filter(rs => selectedRequisition.map(r => r.id).includes(rs.req_id)).length === 0 && (
                    <div className="px-4 py-8 text-center">
                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            No services available. Select a service requisition first.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
