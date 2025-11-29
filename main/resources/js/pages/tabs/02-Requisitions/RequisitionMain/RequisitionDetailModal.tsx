import { useState, useEffect, useRef, Fragment } from 'react';
import { router } from '@inertiajs/react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';

// Import your components
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

    // --- 1. SAFE DATA NORMALIZATION (Prevents Crashes) ---
    // We create safe variables that work regardless of capitalization
    const safeReq = requisition || {};
    const id = safeReq.id || safeReq.ID;
    const status = safeReq.status || safeReq.STATUS || 'pending';
    const type = safeReq.type || safeReq.TYPE || 'items';
    const priority = safeReq.priority || safeReq.PRIORITY || 'normal';
    const requestor = safeReq.requestor || safeReq.REQUESTOR || 'Unknown';
    const created_at = safeReq.created_at || safeReq.CREATED_AT;
    const updated_at = safeReq.updated_at || safeReq.UPDATED_AT;
    const notes = safeReq.notes || safeReq.NOTES;
    const remarks = safeReq.remarks || safeReq.REMARKS;
    const total_cost = safeReq.total_cost || safeReq.TOTAL_AMOUNT || 0;

    // Combine Items and Services into one safe array
    const rawItems = safeReq.items || safeReq.ITEMS || safeReq.services || safeReq.SERVICES || [];

    // --- 2. LOGIC VARIABLES ---
    const isServiceRequisition = type.toLowerCase() === 'services';
    const totalItems = rawItems.length;
    const isPending = status.toLowerCase() === 'pending';
    const isApproved = status.toLowerCase() === 'approved';

    // --- 3. HANDLERS ---
    const handleStatusChange = (newStatus: string) => {
        if (newStatus === 'rejected') {
            setShowDeclineModal(true);
        } else {
            onStatusUpdate(id, newStatus);
            onClose();
        }
        setShowStatusDropdown(false);
    };

    const handleAccept = () => {
        onStatusUpdate(id, 'approved');
        onClose();
    };

    const handleDecline = (reason: string) => {
        onStatusUpdate(id, 'rejected', reason);
        onClose();
        setShowDeclineModal(false);
    };

    const handleEdit = () => {
        router.get(`/requisitions/${id}/edit`);
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

    if (!requisition || !isOpen) return null;

    const statusOptions = [
        { value: 'pending', label: 'Pending', description: 'Requisition is created and waiting for approval' },
        { value: 'approved', label: 'Approved', description: 'Requisition has been fully approved' },
        { value: 'rejected', label: 'Rejected', description: 'Requisition has been rejected' },
        { value: 'partially_approved', label: 'Partially Approved', description: 'Approved but PO is edited' },
        { value: 'ordered', label: 'Ordered', description: 'Purchase Order is issued' },
        { value: 'delivered', label: 'Delivered', description: 'Delivery is created' },
        { value: 'awaiting_pickup', label: 'Awaiting Pickup', description: 'Items are ready' },
        { value: 'received', label: 'Received', description: 'Encoder marks it as received' }
    ];

    return (
        <>
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={onClose}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-sidebar text-left align-middle shadow-xl transition-all border border-sidebar-border flex flex-col max-h-[90vh]">

                                    {/* Header - Sticky */}
                                    <div className="flex-shrink-0 p-6 border-b border-sidebar-border bg-white dark:bg-sidebar sticky top-0 z-10 flex items-center justify-between">
                                        <Dialog.Title as="h3" className="text-xl font-bold text-gray-900 dark:text-white">
                                            Requisition #{id} Details
                                        </Dialog.Title>
                                        <button
                                            onClick={onClose}
                                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    {/* Content - Scrollable */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-sidebar">
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
                                                        {getTypeDisplayName(type)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Status
                                                    </label>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                                                            <RequisitionStatusIcon status={status} />
                                                            {getStatusDisplayName(status)}
                                                        </div>

                                                        {/* Status Dropdown */}
                                                        {!isPending && (
                                                            <div className="relative" ref={dropdownRef}>
                                                                <button
                                                                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                                                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                                                >
                                                                    Change Status
                                                                </button>

                                                                {showStatusDropdown && (
                                                                    <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg shadow-lg z-20">
                                                                        <div className="p-3">
                                                                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                                                                                Update Status
                                                                            </div>
                                                                            <div className="max-h-48 overflow-y-auto pr-1">
                                                                                {statusOptions.map((opt) => (
                                                                                    <button
                                                                                        key={opt.value}
                                                                                        onClick={() => handleStatusChange(opt.value)}
                                                                                        className={`w-full text-left px-3 py-3 text-sm flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-sidebar-accent transition-colors rounded-md ${
                                                                                            status === opt.value
                                                                                                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                                                                                : 'border border-transparent'
                                                                                        }`}
                                                                                    >
                                                                                        <div className={`w-3 h-3 mt-1 rounded-full flex-shrink-0 ${
                                                                                            status === opt.value ? 'bg-blue-600' : 'bg-gray-300'
                                                                                        }`} />
                                                                                        <div>
                                                                                            <div className="font-medium text-gray-900 dark:text-white">{opt.label}</div>
                                                                                            <div className="text-xs text-gray-500">{opt.description}</div>
                                                                                        </div>
                                                                                    </button>
                                                                                ))}
                                                                            </div>
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
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getPriorityColor(priority)}`}>
                                                        {PriorityIcons[priority.toLowerCase() as keyof typeof PriorityIcons]}
                                                        {priority}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Requested By
                                                    </label>
                                                    <p className="text-sm text-gray-900 dark:text-white">{requestor}</p>
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
                                                        {formatDate(created_at)} at {formatTime(created_at)}
                                                    </p>
                                                </div>
                                                {updated_at && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Last Updated
                                                        </label>
                                                        <p className="text-sm text-gray-900 dark:text-white">
                                                            {formatDate(updated_at)} at {formatTime(updated_at)}
                                                        </p>
                                                    </div>
                                                )}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Total Cost
                                                    </label>
                                                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                                        ₱{Number(total_cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notes & Remarks */}
                                        <div className="space-y-4">
                                            {notes && (
                                                <div className="bg-gray-50 dark:bg-sidebar-accent p-4 rounded-lg border border-sidebar-border">
                                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                                        Notes
                                                    </label>
                                                    <p className="text-sm text-gray-900 dark:text-gray-300">{notes}</p>
                                                </div>
                                            )}
                                            {remarks && (
                                                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-100 dark:border-red-900/20">
                                                    <label className="block text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">
                                                        Remarks / Reason
                                                    </label>
                                                    <p className="text-sm text-gray-900 dark:text-gray-300">{remarks}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Items Table */}
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                                Requested {isServiceRequisition ? 'Services' : 'Items'} ({totalItems})
                                            </h4>
                                            <div className="border border-sidebar-border rounded-lg overflow-hidden bg-white dark:bg-sidebar-accent">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-gray-50 dark:bg-sidebar border-b border-sidebar-border">
                                                    <tr>
                                                        <th className="py-3 px-4 text-left font-medium text-gray-500 dark:text-gray-400 w-12">#</th>
                                                        <th className="py-3 px-4 text-left font-medium text-gray-500 dark:text-gray-400 w-24">
                                                            {isServiceRequisition ? 'Hours' : 'Qty'}
                                                        </th>
                                                        <th className="py-3 px-4 text-left font-medium text-gray-500 dark:text-gray-400">
                                                            {isServiceRequisition ? 'Service Name' : 'Item Name'}
                                                        </th>
                                                        {!isServiceRequisition && (
                                                            <th className="py-3 px-4 text-left font-medium text-gray-500 dark:text-gray-400">Category</th>
                                                        )}
                                                        <th className="py-3 px-4 text-right font-medium text-gray-500 dark:text-gray-400 w-32">Unit Price</th>
                                                        <th className="py-3 px-4 text-right font-medium text-gray-500 dark:text-gray-400 w-32">Total</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-sidebar-border">
                                                    {rawItems.map((item: any, index: number) => {
                                                        // Normalize Item Data (Handle Uppercase or Lowercase)
                                                        const iQty = item.quantity || item.QUANTITY || 0;
                                                        const iName = item.name || item.NAME || 'Unknown';
                                                        const iCat = item.category || item.CATEGORY || 'General';
                                                        const iPrice = item.unit_price || item.UNIT_PRICE || 0;
                                                        const iTotal = item.total_price || item.TOTAL || (iQty * iPrice);

                                                        return (
                                                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-sidebar">
                                                                <td className="py-3 px-4 text-gray-500">{index + 1}</td>
                                                                <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">{iQty}</td>
                                                                <td className="py-3 px-4 text-gray-900 dark:text-white">
                                                                    <div className="font-medium">{iName}</div>
                                                                    {isServiceRequisition && item.description && (
                                                                        <div className="text-xs text-gray-500">{item.description}</div>
                                                                    )}
                                                                </td>
                                                                {!isServiceRequisition && (
                                                                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-sidebar border border-sidebar-border">
                                                                                {iCat}
                                                                            </span>
                                                                    </td>
                                                                )}
                                                                <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                                                                    ₱{Number(iPrice).toLocaleString()}
                                                                </td>
                                                                <td className="py-3 px-4 text-right font-bold text-green-600 dark:text-green-400">
                                                                    ₱{Number(iTotal).toLocaleString()}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                    {rawItems.length === 0 && (
                                                        <tr>
                                                            <td colSpan={6} className="py-4 text-center text-gray-500 italic">
                                                                No items found.
                                                            </td>
                                                        </tr>
                                                    )}
                                                    </tbody>
                                                    <tfoot className="bg-gray-50 dark:bg-sidebar border-t border-sidebar-border">
                                                    <tr>
                                                        <td colSpan={isServiceRequisition ? 4 : 4} className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">
                                                            Grand Total:
                                                        </td>
                                                        <td colSpan={2} className="py-3 px-4 text-right text-lg font-bold text-green-600 dark:text-green-400">
                                                            ₱{Number(total_cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </td>
                                                    </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex-shrink-0 p-6 border-t border-sidebar-border bg-gray-50 dark:bg-sidebar-accent">
                                        <div className="flex justify-between items-center">
                                            <button
                                                onClick={handleEdit}
                                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                                            >
                                                Edit Requisition
                                            </button>

                                            <div className="flex gap-3">
                                                {isPending && (
                                                    <>
                                                        <button
                                                            onClick={() => setShowDeclineModal(true)}
                                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                                                        >
                                                            Decline
                                                        </button>
                                                        <button
                                                            onClick={handleAccept}
                                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
                                                        >
                                                            Accept
                                                        </button>
                                                    </>
                                                )}

                                                {isApproved && (
                                                    <button
                                                        onClick={handleCreatePurchaseOrder}
                                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100"
                                                    >
                                                        Create Purchase Order
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Decline Reason Modal */}
            <DeclineReasonModal
                isOpen={showDeclineModal}
                onClose={() => setShowDeclineModal(false)}
                onConfirm={handleDecline}
            />
        </>
    );
}

// --- HELPER COMPONENTS & FUNCTIONS ---

function RequisitionStatusIcon({ status }: { status: string }) {
    // Safety check
    const safeStatus = (status || 'pending').toLowerCase();

    switch (safeStatus) {
        case 'pending': return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'approved': return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'rejected': return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
        default: return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
}

function getStatusDisplayName(status: string): string {
    if (!status) return 'Unknown';
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
    return statusMap[status.toLowerCase()] || status;
}

function getTypeDisplayName(type: string): string {
    if (!type) return 'Items';
    const typeMap: { [key: string]: string } = {
        'items': 'Items',
        'services': 'Services'
    };
    return typeMap[type.toLowerCase()] || type;
}
