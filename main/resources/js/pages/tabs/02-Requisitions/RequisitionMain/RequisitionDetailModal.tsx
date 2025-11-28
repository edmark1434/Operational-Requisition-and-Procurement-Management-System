import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import DeclineReasonModal from './DeclineReasonModal';
import { StatusIcons, PriorityIcons } from './utils/icons';
import { getStatusColor, getPriorityColor } from './utils/styleUtils';
import { formatDate, formatTime } from './utils/formatters';

interface RequisitionDetailModalProps {
    requisition: any;
    isOpen: boolean;
    onClose: () => void;
    onStatusUpdate: (id: number, status: string, reason?: string) => void;
}

export default function RequisitionDetailModal({
                                                   requisition,
                                                   isOpen,
                                                   onClose,
                                                   onStatusUpdate,
                                               }: RequisitionDetailModalProps) {
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isServiceRequisition = requisition?.TYPE === 'services';
    const itemsCount = requisition?.ITEMS?.length || 0;
    const servicesCount = requisition?.SERVICES?.length || 0;
    const totalItems = isServiceRequisition ? servicesCount : itemsCount;
    const isPending = requisition?.STATUS?.toLowerCase() === 'pending';
    const isApproved = requisition?.STATUS?.toLowerCase() === 'approved';

    const handleStatusChange = (newStatus: string) => {
        if (requisition) {
            // If changing to rejected, show the decline reason modal
            if (newStatus === 'rejected') {
                setShowDeclineModal(true);
            } else {
                onStatusUpdate(requisition.ID, newStatus);
                onClose(); // Close modal after status change
            }
        }
        setShowStatusDropdown(false);
    };

    const handleAccept = () => {
        if (requisition) {
            onStatusUpdate(requisition.ID, 'approved');
            onClose(); // Close modal after accept
        }
    };

    const handleDecline = (reason: string) => {
        if (requisition) {
            onStatusUpdate(requisition.ID, 'rejected', reason);
            onClose(); // Close modal after decline with reason
        }
        setShowDeclineModal(false);
    };

    const handleEdit = () => {
        router.get(`/requisitions/${requisition.ID}/edit`);
        onClose();
    };

    const handleCreatePurchaseOrder = () => {
        router.get('/purchases/create');
        onClose();
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowStatusDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!isOpen) return null;

    const statusOptions = [
        { value: 'pending', label: 'Pending', description: 'Requisition is created and waiting for approval' },
        { value: 'approved', label: 'Approved', description: 'Requisition has been fully approved' },
        { value: 'rejected', label: 'Rejected', description: 'Requisition has been rejected' },
        { value: 'partially_approved', label: 'Partially Approved', description: 'Approved but PO is edited (e.g., 5 instead of 6 items)' },
        { value: 'ordered', label: 'Ordered', description: 'Purchase Order is issued (skipped when inventory has the items)' },
        { value: 'delivered', label: 'Delivered', description: 'Delivery is created (skipped when inventory has the items)' },
        { value: 'awaiting_pickup', label: 'Awaiting Pickup', description: 'Items are ready, requestor has to claim' },
        { value: 'received', label: 'Received', description: 'Encoder marks it as received' }
    ];

    // Calculate column span for the total row
    const totalColSpan = isServiceRequisition ? 6 : 5; // Adjusted for the new table structure

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-sidebar rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-sidebar-border">
                    {/* Header - Sticky */}
                    <div className="flex-shrink-0 p-6 border-b border-sidebar-border bg-white dark:bg-sidebar sticky top-0 z-10">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Requisition #{requisition.ID} Details
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
                    </div>

                    {/* Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6 space-y-6 bg-white dark:bg-sidebar">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Type
                                        </label>
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                                            isServiceRequisition
                                                ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                                : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                        }`}>
                                            {isServiceRequisition ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            )}
                                            {getTypeDisplayName(requisition.TYPE)}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Status
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(requisition.STATUS)}`}>
                                                <RequisitionStatusIcon status={requisition.STATUS} />
                                                {getStatusDisplayName(requisition.STATUS)}
                                            </div>
                                            {!isPending && (
                                                <div className="relative" ref={dropdownRef}>
                                                    <button
                                                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                        </svg>
                                                        Change Status
                                                    </button>

                                                    {showStatusDropdown && (
                                                        <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg shadow-lg z-20">
                                                            <div className="p-3">
                                                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                                                                    Update Status
                                                                </div>
                                                                {/* Scrollable container with fixed height */}
                                                                <div className="max-h-48 overflow-y-auto pr-1"> {/* Shows ~4 items at a time */}
                                                                    {statusOptions.map((status) => (
                                                                        <button
                                                                            key={status.value}
                                                                            onClick={() => handleStatusChange(status.value)}
                                                                            className={`w-full text-left px-3 py-3 text-sm flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-sidebar-accent transition-colors rounded-md ${
                                                                                requisition?.STATUS === status.value
                                                                                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                                                                    : 'border border-transparent'
                                                                            }`}
                                                                        >
                                                                            {/* Status indicator with dot and check */}
                                                                            <div className="flex items-center gap-3 flex-1">
                                                                                <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                                                                                    requisition?.STATUS === status.value
                                                                                        ? 'bg-blue-600 dark:bg-blue-400'
                                                                                        : 'bg-gray-300 dark:bg-gray-600'
                                                                                }`}>
                                                                                    {requisition?.STATUS === status.value && (
                                                                                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                                        </svg>
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                                                        {status.label}
                                                                                    </div>
                                                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                                                                        {status.description}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </button>
                                                                    ))}
                                                                </div>

                                                                {/* Optional: Show scroll indicator when there are more items */}
                                                                {statusOptions.length > 4 && (
                                                                    <div className="mt-2 pt-2 border-t border-sidebar-border">
                                                                        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                                                                            Scroll for more options
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Priority
                                        </label>
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getPriorityColor(requisition.PRIORITY)}`}>
                                            {PriorityIcons[requisition.PRIORITY.toLowerCase() as keyof typeof PriorityIcons]}
                                            {requisition.PRIORITY}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Requested By
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white">{requisition.REQUESTOR}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Total {isServiceRequisition ? 'Services' : 'Items'}
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white">{totalItems}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Created
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {formatDate(requisition.CREATED_AT)} at {formatTime(requisition.CREATED_AT)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Last Updated
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {formatDate(requisition.UPDATED_AT)} at {formatTime(requisition.UPDATED_AT)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Notes & Reason */}
                            <div className="space-y-4">
                                {requisition.NOTES && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Notes
                                        </label>
                                        <div className="text-sm text-gray-900 dark:text-gray-300 bg-gray-50 dark:bg-sidebar-accent p-4 rounded-lg border border-sidebar-border">
                                            {requisition.NOTES}
                                        </div>
                                    </div>
                                )}
                                {requisition.REMARKS && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Reason
                                        </label>
                                        <div className="text-sm text-gray-900 dark:text-gray-300 bg-gray-50 dark:bg-sidebar-accent p-4 rounded-lg border border-sidebar-border">
                                            {requisition.REMARKS}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Items/Services List - TABLE LAYOUT */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Requested {isServiceRequisition ? 'Services' : 'Items'} ({totalItems})
                                </label>
                                <div className="border border-sidebar-border rounded-lg overflow-hidden bg-white dark:bg-sidebar-accent"><table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-sidebar border-b border-sidebar-border">
                                    <tr>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                                            #
                                        </th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                                            {isServiceRequisition ? 'Hours' : 'Quantity'}
                                        </th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            {isServiceRequisition ? 'Service Name' : 'Item Name'}
                                        </th>
                                        {!isServiceRequisition && (
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Category
                                            </th>
                                        )}
                                        {isServiceRequisition && (
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Description
                                            </th>
                                        )}
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                                            Unit Price
                                        </th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                                            Total
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-sidebar-border">
                                    {isServiceRequisition ? (
                                        // Services Table
                                        requisition.SERVICES?.map((service: any, index: number) => (
                                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-sidebar">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 dark:bg-sidebar border border-sidebar-border rounded text-xs">
                            {index + 1}
                        </span>
                                                </td>
                                                <td className="py-3 px-4 text-sm font-bold text-blue-600 dark:text-blue-400">
                                                    {service.QUANTITY}
                                                </td>
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                                                    {service.NAME}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                                    {service.DESCRIPTION}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                                    ${service.UNIT_PRICE || '0.00'}/hr
                                                </td>
                                                <td className="py-3 px-4 text-sm font-bold text-green-600 dark:text-green-400">
                                                    ${service.TOTAL || '0.00'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        // Items Table
                                        requisition.ITEMS.map((item: any, index: number) => (
                                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-sidebar">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 dark:bg-sidebar border border-sidebar-border rounded text-xs">
                            {index + 1}
                        </span>
                                                </td>
                                                <td className="py-3 px-4 text-sm font-bold text-blue-600 dark:text-blue-400">
                                                    {item.QUANTITY}
                                                </td>
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                                                    {item.NAME}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-sidebar border border-sidebar-border">
                            {item.CATEGORY}
                        </span>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                                    ${item.UNIT_PRICE || '0.00'}
                                                </td>
                                                <td className="py-3 px-4 text-sm font-bold text-green-600 dark:text-green-400">
                                                    ${item.TOTAL || '0.00'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    </tbody>
                                    {/* Total Row - Fixed positioning */}
                                    <tfoot className="bg-gray-50 dark:bg-sidebar border-t border-sidebar-border">
                                    <tr>
                                        <td colSpan={isServiceRequisition ? 5 : 4} className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white text-left">
                                            Grand Total:
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                            {/* Empty cell for Unit Price column */}
                                        </td>
                                        <td className="py-3 px-4 text-lg font-bold text-green-600 dark:text-green-400">
                                            ${requisition.TOTAL_AMOUNT?.toFixed(2) || '0.00'}
                                        </td>
                                    </tr>
                                    </tfoot>
                                </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer with Actions */}
                    <div className="flex-shrink-0 p-6 border-t border-sidebar-border bg-gray-50 dark:bg-sidebar-accent">
                        <div className="flex justify-between items-center">
                            <button
                                onClick={handleEdit}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Requisition
                            </button>

                            <div className="flex gap-3">
                                {/* Accept/Decline Buttons for Pending Requisitions */}
                                {isPending && (
                                    <>
                                        <button
                                            onClick={() => setShowDeclineModal(true)}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Decline
                                        </button>
                                        <button
                                            onClick={handleAccept}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Accept
                                        </button>
                                    </>
                                )}

                                {/* Create Purchase Order Button for Approved Requisitions */}
                                {isApproved && (
                                    <button
                                        onClick={handleCreatePurchaseOrder}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Create Purchase Order
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decline Reason Modal */}
            <DeclineReasonModal
                isOpen={showDeclineModal}
                onClose={() => setShowDeclineModal(false)}
                onConfirm={handleDecline}
            />
        </>
    );
}

// Status Icon Component for Requisitions
function RequisitionStatusIcon({ status }: { status: string }) {
    switch (status?.toLowerCase()) {
        case 'pending':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        case 'approved':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        case 'rejected':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            );
        case 'partially_approved':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
            );
        case 'ordered':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            );
        case 'delivered':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            );
        case 'awaiting_pickup':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            );
        case 'received':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            );
        default:
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
    }
}

// Helper function to get display name for requisition status
function getStatusDisplayName(status: string): string {
    const statusMap: { [key: string]: string } = {
        'pending': 'Pending',
        'approved': 'Approved',
        'rejected': 'Rejected',
        'partially_approved': 'Partially Approved',
        'ordered': 'Ordered',
        'delivered': 'Delivered',
        'awaiting_pickup': 'Awaiting Pickup',
        'received': 'Received'
    };
    return statusMap[status?.toLowerCase()] || status;
}

// Helper function to get display name for requisition type
function getTypeDisplayName(type: string): string {
    const typeMap: { [key: string]: string } = {
        'items': 'Items',
        'services': 'Services'
    };
    return typeMap[type?.toLowerCase()] || type;
}
