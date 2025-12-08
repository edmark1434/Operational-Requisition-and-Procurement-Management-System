import {
    Category,
    Requisition,
    RequisitionItem,
    RequisitionService,
    Vendor
} from "@/pages/tabs/04-Purchases/PurchaseOrderForm";
import { groupRequisitionItems } from "@/pages/tabs/04-Purchases/utils/groupedItems";
import { groupRequisitionServices } from "@/pages/tabs/04-Purchases/utils/groupedServices";

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
    categories: Category[];
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
                                         isEditMode,
                                         categories,
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
    const getRequisitionData = (): {
        REQUESTOR: string,
        PRIORITY: string[],
        CATEGORIES: number[],
        ITEMS: RequisitionItem[]
    } => {
        if (!selectedRequisition || selectedRequisition.length === 0) {
            return {
                REQUESTOR: 'N/A',
                PRIORITY: ['N/A'],
                CATEGORIES: [],
                ITEMS: []
            };
        }

        // --- Unique Requestors ---
        const uniqueRequestors = Array.from(
            new Set(selectedRequisition.map(r => r.requestor))
        );

        const REQUESTOR =
            uniqueRequestors.length === 0
                ? 'N/A'
                : uniqueRequestors.length === 1
                    ? uniqueRequestors[0] || 'N/A'
                    : `${uniqueRequestors.length} requestors`;


        // --- Priorities ---
        const PRIORITY = Array.from(
            new Set(selectedRequisition.map(r => r.priority))
        );

        // --- Categories ---
        const CATEGORIES = Array.from(
            new Set([
                ...selectedItems.map(r => r.item.category_id),
                ...selectedServices.map(s => s.service.category_id)
            ])
        );

        // --- All Items from the Selected Requisitions ---
        const ITEMS = selectedRequisition.flatMap(req =>
            selectedItems.filter(i => i.req_id === req.id)
        );

        return {
            REQUESTOR,
            PRIORITY,
            CATEGORIES,
            ITEMS
        };
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
                                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 self-start">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                        </svg>
                                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                            Merging {formData.REQUISITION_IDS.length} requisitions into one PO
                                        </span>
                                    </div>
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
                            {formData.ORDER_TYPE !== 'Services' ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Total Amount
                                    </label>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {formatCurrency(totalCost)}
                                    </p>
                                </div>
                                ) : (
                                <div className="h-16"></div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Order Type
                                </label>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {formData.ORDER_TYPE}
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
                                <p className="font-medium text-gray-900 dark:text-white mt-2">{requisitionData.REQUESTOR}</p>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Priority:</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    { requisitionData.PRIORITY.map(p =>
                                        <div className="">
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                            p === 'Urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                            p === 'High' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                        }`}>
                                            {p}
                                        </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Categories:</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    { requisitionData.CATEGORIES.map(cId =>
                                        <div className="">
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`}>
                                            {categories.find(c => c.id === cId)?.name || 'N/A'}
                                        </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">
                                    {formData.ORDER_TYPE === 'Items' ? 'Items:' : 'Services:'}
                                </span>
                                <p className="font-medium text-gray-900 dark:text-white mt-2">
                                    {formData.ORDER_TYPE === 'Items'
                                        ? groupRequisitionItems(selectedItems).length
                                        : groupRequisitionServices(selectedServices).length
                                    }
                                </p>
                            </div>
                        </div>

                        {selectedRequisition && selectedRequisition.length > 1 && (
                            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                                {selectedRequisition.map((req) => {
                                    const count = formData.ORDER_TYPE === 'Items'
                                        ? selectedItems.filter(i => i.req_id === req.id)?.length || 0
                                        : selectedServices.filter(s => s.req_id === req.id)?.length || 0;

                                    const label = formData.ORDER_TYPE === 'Items' ? 'items' : 'services';

                                    return (
                                        <div key={req.id} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">{req.ref_no} - {req.requestor}</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{count} {label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                    </div>

                    {formData.ORDER_TYPE === 'Items' && (
                        <div className="border-t border-sidebar-border pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Order Items ({groupRequisitionItems(selectedItems).length})
                            </h3>
                            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border shadow-sm">
                                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-sidebar-accent border-b border-sidebar-border text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    <div className="col-span-6">Item Details</div>
                                    <div className="col-span-2 text-right">Quantity</div>
                                    <div className="col-span-2 text-right">Unit Price</div>
                                    <div className="col-span-2 text-right">Total</div>
                                </div>
                                <div className="divide-y divide-sidebar-border">
                                    {groupRequisitionItems(selectedItems).map((groupedItem) => (
                                        <div key={`preview-${groupedItem.item_id}`} className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-sidebar-accent transition-colors">
                                            <div className="col-span-6">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {groupedItem.item.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {categories.find(c => c.id === groupedItem.categoryId)?.name || 'Cannot get category'}
                                                </p>
                                                {groupedItem.reqItems.length > 1 && (
                                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                        📦 Merged from {groupedItem.reqItems.length} requisitions
                                                    </p>
                                                )}
                                            </div>
                                            <div className="col-span-2 text-right">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {groupedItem.total_quantity}
                                                </p>
                                            </div>
                                            <div className="col-span-2 text-right">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {formatCurrency(groupedItem.unit_price)}
                                                </p>
                                            </div>
                                            <div className="col-span-2 text-right">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {formatCurrency(groupedItem.total_quantity * groupedItem.unit_price)}
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
                    )}

                    {formData.ORDER_TYPE === 'Services' && (
                        <div className="border-t border-sidebar-border pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Order Services ({groupRequisitionServices(selectedServices).length})
                            </h3>
                            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border shadow-sm">
                                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-sidebar-accent border-b border-sidebar-border text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    <div className="col-span-8">Service Details</div>
                                    <div className="col-span-2 text-center">Category</div>
                                    <div className="col-span-2 text-right">Hourly Rate</div>
                                </div>
                                <div className="divide-y divide-sidebar-border">
                                    {groupRequisitionServices(selectedServices).map((groupedService) => (
                                        <div key={`preview-${groupedService.service_id}`} className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-sidebar-accent transition-colors">
                                            <div className="col-span-8">
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
                                            <div className="col-span-2 text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-sidebar text-gray-600 dark:text-gray-400">
                                {categories.find(c => c.id === groupedService.categoryId)?.name || 'Cannot get category'}
                            </span>
                                            </div>
                                            <div className="col-span-2 text-right">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {formatCurrency(groupedService.service.hourly_rate)}/hr
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}


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
