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
        return formData.SERVICES;
    };

    const calculateSubtotal = () => {
        return formData.SERVICES
            .reduce((total: number, service: any) => total + (service.QUANTITY * service.UNIT_PRICE), 0);
    };

    if (!selectedRequisition) {
        return null;
    }

    const selectedServices = getSelectedServices();
    const subtotal = calculateSubtotal();

    const reqServicetoFormService = (reqService: RequisitionService) => {
        return formData.SERVICES.find(service => service.id === reqService.id) || {}
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Order Services
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedServices.length} of {requisitionServices.filter(rs => selectedRequisition.map(r => r.id).includes(rs.req_id)).length} service{requisitionServices.filter(rs => selectedRequisition.map(r => r.id).includes(rs.req_id)).length > 1 ? 's' : ''} selected
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
                    <div className="col-span-5 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center">
                        Category
                    </div>
                    <div className="col-span-2 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider text-right">
                        Hourly Rate
                    </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-sidebar-border max-h-96 overflow-y-auto">
                    {requisitionServices.filter(rs => selectedRequisition.map(r => r.id).includes(rs.req_id)).map((service) => {
                        const serviceTotal = service.service.hourly_rate;

                        return (
                            <div
                                key={service.id}
                                className={`grid grid-cols-12 gap-4 px-4 py-3 items-center transition-colors ${
                                    formData.SERVICES.some(i => i.id === service.id)
                                        ? 'bg-purple-50 dark:bg-purple-900/10 hover:bg-purple-100 dark:hover:bg-purple-900/20'
                                        : 'hover:bg-gray-50 dark:hover:bg-sidebar'
                                }`}
                            >
                                {/* Select Checkbox */}
                                <div className="col-span-1">
                                    <input
                                        type="checkbox"
                                        checked={formData.SERVICES.some(i => i.id === service.id) || false}
                                        onChange={() => onToggleServiceSelection(service.id)}
                                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                    />
                                </div>

                                {/* Service Details */}
                                <div className="col-span-4">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {service.service.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {service.service.description}
                                    </p>
                                </div>

                                {/* Category */}
                                <div className="col-span-5 text-center">
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-sidebar text-gray-600 dark:text-gray-400">
                                        {categories.find(c => c.id === service.service.category_id)?.name || 'N/A'}
                                    </span>
                                </div>

                                {/* Hourly Rate */}
                                <div className="col-span-2 text-right">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(service.service.hourly_rate)}/hr
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary Section */}
                {selectedServices.length > 0 && (
                    <>
                        {/* Summary Breakdown */}
                        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-sidebar border-t border-sidebar-border">
                            <div className="col-span-12">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="text-gray-600 dark:text-gray-400">
                                        <span className="font-medium">{selectedServices.length}</span> service{selectedServices.length > 1 ? 's' : ''} selected •
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
