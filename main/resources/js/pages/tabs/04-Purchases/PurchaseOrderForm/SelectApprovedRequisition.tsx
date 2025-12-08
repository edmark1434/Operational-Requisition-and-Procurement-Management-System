import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import requisitionItems from "@/pages/datasets/requisition_item";
import {Category, Requisition, RequisitionItem, RequisitionService} from "@/pages/tabs/04-Purchases/PurchaseOrderForm";

interface SelectApprovedRequisitionProps {
    formData: {
        REQUISITION_IDS: string[];
        ORDER_TYPE?: string;
    };
    selectedRequisitions: Requisition[];
    approvedRequisitions: Requisition[];
    errors: { [key: string]: string };
    onRequisitionSelect: (requisitionId: string) => void;
    onRequisitionRemove: (requisitionId: string) => void;
    isEditMode: boolean;
    requisitionItems: RequisitionItem[];
    requisitionServices: RequisitionService[];
    categories: Category[];
}

export default function SelectApprovedRequisition({
                                                      formData,
                                                      selectedRequisitions,
                                                      approvedRequisitions,
                                                      errors,
                                                      onRequisitionSelect,
                                                      onRequisitionRemove,
                                                      isEditMode,
                                                      requisitionItems,
                                                      requisitionServices,
                                                      categories
                                                  }: SelectApprovedRequisitionProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

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

    // Filter requisitions based on order type and search term
    const filteredRequisitions = approvedRequisitions.filter(requisition => {
        // Filter by order type - only show requisitions that match the selected order type
        const typeMatch = formData.ORDER_TYPE ? requisition.type === formData.ORDER_TYPE : false;

        // Filter by search term
        const searchMatch = !searchTerm ||
            requisition.ref_no.toString().includes(searchTerm) ||
            requisition.requestor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            requisition.notes?.toLowerCase().includes(searchTerm.toLowerCase());

        return typeMatch && searchMatch;
    });

    const getRequisitionTypeLabel = (type: string) => {
        switch (type) {
            case 'Items': return 'item';
            case 'Services': return 'service';
            default: return type;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Items': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'Services': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const handleRequisitionClick = (requisitionId: string) => {
        onRequisitionSelect(requisitionId);
        setIsDropdownOpen(false);
        setSearchTerm('');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.requisition-dropdown')) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Show different messages based on order type selection
    const getEmptyStateMessage = () => {
        if (!formData.ORDER_TYPE) {
            return "Please select an order type first to see available requisitions";
        }

        if (searchTerm) {
            return `No ${getRequisitionTypeLabel(formData.ORDER_TYPE).toLowerCase()} requisitions match your search`;
        }

        return `No approved ${getRequisitionTypeLabel(formData.ORDER_TYPE).toLowerCase()} requisitions available`;
    };

    // Clear selected requisitions when order type changes
    useEffect(() => {
        if (formData.ORDER_TYPE && selectedRequisitions.length > 0) {
            const mismatchedRequisitions = selectedRequisitions.filter(
                req => req.type !== formData.ORDER_TYPE
            );
            if (mismatchedRequisitions.length > 0) {
                mismatchedRequisitions.forEach(req => {
                    onRequisitionRemove(req.id.toString());
                });
            }
        }
    }, [formData.ORDER_TYPE]);

    const getRequisitionCategories = (requisition: Requisition) => {
        const categoryIds = new Set([
            ...requisitionItems
                .filter(ri => ri.req_id === requisition.id)
                .map(ri => ri.item.category_id),
            ...requisitionServices
                .filter(rs => rs.req_id === requisition.id)
                .map(rs => rs.service.category_id)
        ]);
        return categories.filter(cat => categoryIds.has(cat.id));
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-2">
                Select Approved Requisitions <span className="text-red-500">*</span>
            </h3>

            {/* Order Type Requirement */}
            {!formData.ORDER_TYPE && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                            Please select an Order Type first to see available requisitions
                        </p>
                    </div>
                </div>
            )}

            {/* Order Type Filter Status */}
            {formData.ORDER_TYPE && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                Showing {getRequisitionTypeLabel(formData.ORDER_TYPE)} requisitions
                            </span>
                        </div>
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                            {filteredRequisitions.length} found
                        </span>
                    </div>
                </div>
            )}

            {/* Selected Requisitions Tags */}
            {selectedRequisitions.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Selected Requisitions ({selectedRequisitions.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {selectedRequisitions.map((requisition) => (
                            <div
                                key={requisition.id}
                                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg text-sm border border-blue-200 dark:border-blue-700"
                            >
                                <span className="font-medium">{requisition.ref_no}</span>
                                <span className="text-blue-600 dark:text-blue-400">•</span>
                                {getRequisitionCategories(requisition).map(category => (
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getTypeColor(requisition.type)}`}>
                                    {category.name}
                                    </span>
                                ))}
                                <span className="text-blue-600 dark:text-blue-400">•</span>
                                <span>{requisitionItems.filter(ri => ri.req_id === requisition.id)?.length || requisitionServices.filter(rs => rs.req_id === requisition.id)?.length || 0} {getRequisitionTypeLabel(formData.ORDER_TYPE ?? '')}
                                    {requisitionItems.filter(ri => ri.req_id === requisition.id)?.length || requisitionServices.filter(rs => rs.req_id === requisition.id)?.length || 0 > 1 ? 's' : ''}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onRequisitionRemove(requisition.id.toString())}
                                    className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Dynamic Dropdown */}
            <div className="relative requisition-dropdown">
                <button
                    type="button"
                    onClick={() => formData.ORDER_TYPE && setIsDropdownOpen(!isDropdownOpen)}
                    disabled={!formData.ORDER_TYPE}
                    className={`w-full px-3 py-2 border rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white flex justify-between items-center ${
                        errors.REQUISITION_IDS ? 'border-red-500' : 'border-sidebar-border'
                    } ${!formData.ORDER_TYPE ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    <span className={selectedRequisitions.length === 0 ? 'text-gray-500' : 'text-gray-900 dark:text-white'}>
                        {!formData.ORDER_TYPE
                            ? "Select order type first..."
                            : selectedRequisitions.length === 0
                                ? `Select ${getRequisitionTypeLabel(formData.ORDER_TYPE).toLowerCase()} requisitions...`
                                : `${selectedRequisitions.length} ${getRequisitionTypeLabel(formData.ORDER_TYPE).toLowerCase()} requisition(s) selected`
                        }
                    </span>
                    <ChevronsUpDown className="w-4 h-4 text-gray-500" />
                </button>

                {isDropdownOpen && formData.ORDER_TYPE && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg shadow-lg max-h-80 overflow-hidden">
                        {/* Search Input */}
                        <div className="p-2 border-b border-sidebar-border">
                            <input
                                type="text"
                                placeholder={`Search ${getRequisitionTypeLabel(formData.ORDER_TYPE).toLowerCase()} requisitions by ID, requestor, or notes...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-sidebar-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                autoFocus
                            />
                        </div>
                        {/* Requisitions List */}
                        <div className="max-h-64 overflow-y-auto">
                            {filteredRequisitions.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                                    {getEmptyStateMessage()}
                                </div>
                            ) : (
                                filteredRequisitions.map((requisition) => {
                                    const isSelected = selectedRequisitions.some(req => req.id === requisition.id);
                                    return (
                                        <div
                                            key={requisition.id}
                                            onClick={() => !isSelected && handleRequisitionClick(requisition.id.toString())}
                                            className={`p-3 border-b border-sidebar-border last:border-b-0 cursor-pointer transition-colors ${
                                                isSelected
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                                                    : 'hover:bg-gray-50 dark:hover:bg-sidebar-accent'
                                            } ${isSelected ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm">{requisition.ref_no}</span>
                                                    {getRequisitionCategories(requisition).map(category => (
                                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getTypeColor(requisition.type)}`}>
                                                            {category.name}
                                                        </span>
                                                    ))}
                                                </div>
                                                {isSelected && (
                                                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                                <div className="flex justify-between">
                                                    <span>Requestor: {requisition.requestor}</span>
                                                    <span>{formatDate(requisition.created_at)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Priority:
                                                        <span className={`ml-1 px-1 rounded text-xs ${
                                                            requisition.priority === 'Urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                                requisition.priority === 'High' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                                                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                        }`}>
                                                            {requisition.priority}
                                                        </span>
                                                    </span>
                                                    <span>
                                                        {requisition.type === 'Items'
                                                            ? `${requisitionItems.filter(ri => ri.req_id === requisition.id)?.length || 0} items`
                                                            : `${requisitionServices.filter(rs => rs.req_id === requisition.id)?.length || 0} services`
                                                        }
                                                    </span>
                                                </div>
                                                {requisition.notes && (
                                                    <p className="text-gray-500 dark:text-gray-400 truncate">
                                                        Notes: {requisition.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {errors.REQUISITION_IDS && (
                    <p className="text-red-500 text-xs mt-1">{errors.REQUISITION_IDS}</p>
                )}
            </div>

            {/* No Requisitions Message */}
            {formData.ORDER_TYPE && approvedRequisitions.filter(req => req.type === formData.ORDER_TYPE).length === 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                            No approved {getRequisitionTypeLabel(formData.ORDER_TYPE).toLowerCase()} requisitions found.
                            Purchase orders can only be created from approved requisitions.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
