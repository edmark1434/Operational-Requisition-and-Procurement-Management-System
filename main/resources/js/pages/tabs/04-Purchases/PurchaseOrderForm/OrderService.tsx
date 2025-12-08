import {
    Category,
    Requisition,
    RequisitionItem,
    RequisitionOrderService,
    RequisitionService
} from "@/pages/tabs/04-Purchases/PurchaseOrderForm";
import { GroupedService, groupRequisitionServices } from "@/pages/tabs/04-Purchases/utils/groupedServices";

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
    requisitionOrderServices: RequisitionOrderService[];
}

export default function OrderService({
                                         formData,
                                         selectedRequisition,
                                         originalQuantities,
                                         errors,
                                         onToggleServiceSelection,
                                         requisitionServices,
                                         categories,
                                         requisitionOrderServices
                                     }: OrderServiceProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Get all reqServices for selected requisitions
    const availableReqServices = requisitionServices.filter(rs =>
        selectedRequisition.map(r => r.id).includes(rs.req_id)
    );

    // Group them for display
    const groupedServices = groupRequisitionServices(availableReqServices);

    // Check if a grouped service is fully selected
    const isGroupedServiceSelected = (groupedService: GroupedService) => {
        return groupedService.reqServices.every(reqService =>
            formData.SERVICES.some(s => s.id === reqService.id)
        );
    };

    // Toggle all reqServices in a group
    const handleToggleGroupedService = (groupedService: GroupedService) => {
        const allSelected = isGroupedServiceSelected(groupedService);

        if (allSelected) {
            // Remove all reqServices in this group
            groupedService.reqServices.forEach(reqService => {
                onToggleServiceSelection(reqService.id);
            });
        } else {
            // Add all reqServices in this group
            groupedService.reqServices.forEach(reqService => {
                if (!formData.SERVICES.some(s => s.id === reqService.id)) {
                    onToggleServiceSelection(reqService.id);
                }
            });
        }
    };

    const calculateSubtotal = () => {
        return formData.SERVICES
            .reduce((total: number, service: any) => total + (service.QUANTITY * service.UNIT_PRICE), 0);
    };

    if (!selectedRequisition) {
        return null;
    }

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
                    {groupedServices.filter(gs => isGroupedServiceSelected(gs)).length} of {groupedServices.length} service{groupedServices.length > 1 ? 's' : ''} selected
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
                    {groupedServices.map((groupedService) => {
                        const isSelected = isGroupedServiceSelected(groupedService);
                        const isAlreadyOrdered = groupedService.reqServices.some(reqService =>
                            requisitionOrderServices.some(i => i.req_service_id === reqService.id)
                        );

                        return (
                            <div
                                key={`grouped-service-${groupedService.service_id}`}
                                className={`grid grid-cols-12 gap-4 px-4 py-3 items-center transition-colors
                                ${isAlreadyOrdered
                                    ? 'opacity-50 bg-neutral-100 dark:bg-neutral-900 font-normal pointer-events-none cursor-not-allowed'
                                    : isSelected
                                        ? 'bg-purple-50 dark:bg-purple-900/10 hover:bg-purple-100 dark:hover:bg-purple-900/20'
                                        : 'hover:bg-gray-50 dark:hover:bg-sidebar'
                                }`}
                            >
                                {/* Select Checkbox */}
                                <div className="col-span-1">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleToggleGroupedService(groupedService)}
                                        disabled={isAlreadyOrdered}
                                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                    />
                                </div>

                                {/* Service Details */}
                                <div className="col-span-4">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {groupedService.service.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {groupedService.service.description}
                                    </p>
                                    {groupedService.reqServices.length > 1 && (
                                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                            📦 Merged from {groupedService.reqServices.length} requisitions
                                        </p>
                                    )}
                                </div>

                                {/* Category */}
                                <div className="col-span-5 text-center">
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-sidebar text-gray-600 dark:text-gray-400">
                                        {categories.find(c => c.id === groupedService.categoryId)?.name || 'N/A'}
                                    </span>
                                </div>

                                {/* Hourly Rate */}
                                <div className="col-span-2 text-right">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(groupedService.service.hourly_rate)}/hr
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary Section */}
                {groupedServices.filter(gs => isGroupedServiceSelected(gs)).length > 0 && (
                    <>
                        {/* Summary Breakdown */}
                        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-sidebar border-t border-sidebar-border">
                            <div className="col-span-12">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="text-gray-600 dark:text-gray-400">
                                        <span className="font-medium">{groupedServices.filter(gs => isGroupedServiceSelected(gs)).length}</span> service{groupedServices.filter(gs => isGroupedServiceSelected(gs)).length > 1 ? 's' : ''} selected
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Empty State */}
                {availableReqServices.length === 0 && (
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
