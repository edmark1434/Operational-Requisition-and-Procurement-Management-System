import { useState, useEffect, useRef, Fragment } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';

// --- UTILITIES (Style Helpers) ---
const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'approved':
            return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border border-green-200 dark:border-green-800';
        case 'partially_approved':
        case 'partially approved':
            return 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300 border border-teal-200 dark:border-teal-800';
        case 'pending':
            return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
        case 'declined':
        case 'rejected':
            return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800';
        case 'awaiting pickup':
            return 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 border border-orange-200 dark:border-orange-800';
        case 'ordered':
            return 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border border-purple-200 dark:border-purple-800';
        case 'completed':
            return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800';
        default:
            return 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
    }
};

const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
        case 'high':
            return 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 border border-orange-200 dark:border-orange-800';
        case 'normal':
            return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
        case 'low':
            return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border border-green-200 dark:border-green-800';
        default:
            return 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
    }
};

// Utils: Formatters
const formatDate = (date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatTime = (date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

// Helper to format currency (PHP)
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    }).format(amount);
};

// Helper to format USD rate
const formatHourlyRate = (rate: number | string) => {
    const value = parseFloat(rate.toString() || '0');
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(value) + " / hr";
};

// Component: DeclineReasonModal
function DeclineReasonModal({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
    const { props } = usePage();
    const permissionsList = props.user_permission as string[];

    const [reason, setReason] = useState('');
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[60]" onClose={onClose}>
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="w-full max-w-md rounded-lg bg-white dark:bg-sidebar  p-6 shadow-xl">
                        <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">Decline Requisition</Dialog.Title>
                        <div className="mt-4">
                            <p className="text-sm text-gray-500 mb-2">Please provide a reason for rejecting this request:</p>
                            <textarea
                                className="w-full border border-gray-300 dark:border-sidebar-border rounded p-2 bg-white dark:bg-input text-gray-900 dark:text-white focus:ring-red-500 focus:border-red-500"
                                rows={3}
                                placeholder="e.g., Item out of stock, Budget exceeded..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={onClose} className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">Cancel</button>
                            <button
                                onClick={() => onConfirm(reason)}
                                disabled={!reason.trim()}
                                className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </Transition>
    );
}

// Icons
const PriorityIcons = {
    high: <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>,
    normal: <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>,
    low: <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
};

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
    const { props } = usePage();
    const permissionsList = props.user_permission as string[];

    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // --- 1. SAFE DATA NORMALIZATION ---
    const safeReq = requisition || {};
    const id = safeReq.id || safeReq.ID;
    const ref_no = safeReq.ref_no || safeReq.REF_NO || `REQ-#${id}`;

    const status = safeReq.status || safeReq.STATUS || 'pending';
    const type = safeReq.type || safeReq.TYPE || 'items';

    // Define isServiceRequisition early
    const isServiceRequisition = type.toLowerCase() === 'services';

    const priority = safeReq.priority || safeReq.PRIORITY || 'normal';
    const requestor = safeReq.requestor || safeReq.REQUESTOR || 'Unknown';
    const created_at = safeReq.created_at || safeReq.CREATED_AT;
    const notes = safeReq.notes || safeReq.NOTES;
    const remarks = safeReq.remarks || safeReq.REMARKS;

    // FIX: Check for standard prop names AND raw relationship names
    const rawItems =
        safeReq.items ||
        safeReq.ITEMS ||
        safeReq.requisition_items || // Raw Eloquent Items
        safeReq.services ||
        safeReq.SERVICES ||
        safeReq.requisition_services || // Raw Eloquent Services
        [];

    const totalItems = rawItems.length;

    // --- LOGIC: Visibility of Approved Column ---
    // Only show column if at least ONE item has approved > 0 AND approved != requested
    const showApprovedColumn = rawItems.some((item: any) => {
        const appQty = parseFloat(item.approved_qty ?? item.APPROVED_QTY ?? item.approved_quantity ?? 0);
        const reqQty = parseFloat(item.quantity ?? 0);
        return appQty > 0 && appQty !== reqQty;
    });

    // --- LOGIC: Calculate Display Total ---
    // Calculates total cost by summing item rows (for Items), or returning parent total (for Services).
    const displayTotalCost = rawItems.reduce((acc: number, item: any) => {
        if (isServiceRequisition) {
            // If service, return parent total and break out of item row calculation
            return safeReq.total_cost || 0;
        }

        const reqQty = parseFloat(item.quantity ?? 0);
        const appQty = parseFloat(item.approved_qty ?? 0);
        const finalQty = appQty > 0 ? appQty : reqQty;
        const price = parseFloat(item.unit_price || item.item?.unit_price || 0);

        return acc + (finalQty * price);
    }, 0);

    // Define finalSummaryCost using the calculated cost.
    const finalSummaryCost = (isServiceRequisition && safeReq.total_cost) ? safeReq.total_cost : displayTotalCost;

    const isPending = status.toLowerCase() === 'pending';
    const isApproved = status.toLowerCase() === 'approved';
    const isPartiallyApproved = status.toLowerCase() === 'partially_approved' || status.toLowerCase() === 'partially approved';
    const isAwaitingPickup = status.toLowerCase() === 'awaiting_pickup' || status.toLowerCase() === 'awaiting pickup';
    const isReceived = status.toLowerCase() === 'completed';

    // --- HANDLERS ---
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
        let targetStatus = 'approved';

        if (showApprovedColumn) {
            // If we have variances displayed, it's partially approved
            targetStatus = 'partially_approved';
        }
        onStatusUpdate(id, targetStatus);
        onClose();
    };

    const handleDecline = (reason: string) => {
        onStatusUpdate(id, 'rejected', reason);
        setShowDeclineModal(false);
        onClose();
    };

    const handleEdit = () => {
        router.get(`/requisitions/${id}/edit`);
        onClose();
    };

    const handleAdjust = () => {
        router.get(`/requisitions/${id}/adjust`);
        onClose();
    };

    const handleCreatePurchaseOrder = () => {
        router.get('/purchases/create');
        onClose();
    };

    const handleReleaseForPickup = () => {
        onStatusUpdate(id, 'awaiting_pickup');
        onClose();
    };

    const handleMarkAsReceived = () => {
        // For Items: Awaiting Pickup -> Ordered
        // For Services: Approved -> completed
        const newStatus = isServiceRequisition ? 'completed' : 'completed';
        onStatusUpdate(id, newStatus);
        onClose();
    };

    // Close dropdown
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
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'partially_approved', label: 'Partially Approved' },
        { value: 'ordered', label: 'Ordered' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'awaiting_pickup', label: 'Awaiting Pickup' },
        { value: 'completed', label: 'Completed' }
    ];

    // --- BUTTON LOGIC ---
    const renderLeftButtons = () => {
        // ITEM TYPE LOGIC
        if (!isServiceRequisition) {
            if (isPending) {
                return (
                    <>
                        <button onClick={handleEdit} className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                            Edit Requisition
                        </button>
                        <button onClick={handleAdjust} className="px-4 py-2 text-sm font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors">
                            Adjust Requisition
                        </button>
                    </>
                );
            }
            if (isApproved || isPartiallyApproved) {
                return (
                    <button onClick={handleReleaseForPickup} className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                        Release for Pickup
                    </button>
                );
            }
            if (isAwaitingPickup) {
                return (
                    <button onClick={handleMarkAsReceived} className="px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                        Mark as Received
                    </button>
                );
            }
        }

        // SERVICE TYPE LOGIC
        if (isServiceRequisition) {
            if (isPending) {
                return (
                    <button onClick={handleEdit} className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                        Edit Requisition
                    </button>
                );
            }
            if (isApproved) {
                return (
                    <button onClick={handleMarkAsReceived} className="px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                        Mark as Completed
                    </button>
                );
            }
        }

        return null;
    };

    const renderRightButtons = () => {
        if (isPending) {
            return (
                <>
                    <button onClick={() => setShowDeclineModal(true)} className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                        Decline
                    </button>
                    <button onClick={handleAccept} className="px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                        Accept
                    </button>
                </>
            );
        }

        // For Items: Show Create Purchase Order when Approved or Partially Approved
        if (!isServiceRequisition && (isApproved || isPartiallyApproved)) {
            return (
                <button onClick={handleCreatePurchaseOrder} className="px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                    Create Purchase Order
                </button>
            );
        }

        return null;
    };

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

                                    {/* Header */}
                                    <div className="flex-shrink-0 p-6 border-b border-sidebar-border bg-white dark:bg-sidebar sticky top-0 z-10 flex items-center justify-between">
                                        <Dialog.Title as="h3" className="text-xl font-bold text-gray-900 dark:text-white">
                                            {ref_no} | Details
                                        </Dialog.Title>
                                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-sidebar">
                                        {/* ... (content remains exactly the same) ... */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                                                        isServiceRequisition
                                                            ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                                            : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                                    }`}>
                                                        {getTypeDisplayName(type)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                                                            <RequisitionStatusIcon status={status} />
                                                            {getStatusDisplayName(status)}
                                                        </div>

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
                                                                            <div className="max-h-48 overflow-y-auto">
                                                                                {statusOptions.map((opt) => (
                                                                                    <button
                                                                                        key={opt.value}
                                                                                        onClick={() => handleStatusChange(opt.value)}
                                                                                        className={`w-full text-left px-3 py-2 text-sm flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-sidebar-accent transition-colors rounded-md ${
                                                                                            status === opt.value ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                                                                        }`}
                                                                                    >
                                                                                        <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${status === opt.value ? 'bg-blue-600' : 'bg-gray-300'}`} />
                                                                                        <div>{opt.label}</div>
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
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getPriorityColor(priority)}`}>
                                                        {PriorityIcons[priority.toLowerCase() as keyof typeof PriorityIcons] || PriorityIcons.normal}
                                                        {priority}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requested By</label>
                                                    <p className="text-sm text-gray-900 dark:text-white">{requestor}</p>
                                                </div>
                                            </div>

                                            {/* Summary Totals */}
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Created</label>
                                                    <p className="text-sm text-gray-900 dark:text-white">
                                                        {formatDate(created_at)} at {formatTime(created_at)}
                                                    </p>
                                                </div>

                                                {/* GRAND TOTAL COST (Hidden for Services) */}
                                                {!isServiceRequisition && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Grand Total Cost
                                                        </label>
                                                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                                            {formatCurrency(finalSummaryCost)}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* NOTES / REMARKS */}
                                        <div className="space-y-4">
                                            {notes && (
                                                <div className="bg-gray-50 dark:bg-sidebar-accent p-4 rounded-lg border border-sidebar-border">
                                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Notes</label>
                                                    <p className="text-sm text-gray-900 dark:text-gray-300">{notes}</p>
                                                </div>
                                            )}

                                            {remarks && (
                                                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-100 dark:border-red-900/20">
                                                    <label className="block text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">Remarks / Reason</label>
                                                    <p className="text-sm text-gray-900 dark:text-gray-300">{remarks}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* TABLE */}
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                                Requested {isServiceRequisition ? 'Services' : 'Items'} ({totalItems})
                                            </h4>
                                            <div className="border border-sidebar-border rounded-lg overflow-hidden bg-white dark:bg-sidebar-accent">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-gray-50 dark:bg-sidebar border-b border-sidebar-border">
                                                    <tr>
                                                        <th className="py-3 px-4 text-left font-medium text-gray-500 w-12">#</th>

                                                        {/* Qty column present ONLY for Items */}
                                                        {!isServiceRequisition && (
                                                            <th className="py-3 px-4 text-left font-medium text-gray-500 w-24">Qty</th>
                                                        )}

                                                        {showApprovedColumn && (
                                                            <th className="py-3 px-4 text-left font-medium text-teal-600 dark:text-teal-400 w-28 bg-teal-50 dark:bg-teal-900/10">
                                                                Approved
                                                            </th>
                                                        )}
                                                        <th className="py-3 px-4 text-left font-medium text-gray-500">Name</th>

                                                        {/* Conditional Columns for Items/Services */}
                                                        {!isServiceRequisition ? (
                                                            <>
                                                                <th className="py-3 px-4 text-left font-medium text-gray-500">Category</th>
                                                                <th className="py-3 px-4 text-right font-medium text-gray-500 w-32">Unit Price</th>
                                                                <th className="py-3 px-4 text-right font-medium text-gray-500 w-32">Total</th>
                                                            </>
                                                        ) : (
                                                            // For Services, replace cost columns with Hourly Rate
                                                            <th className="py-3 px-4 text-left font-medium text-gray-500">Standard Rate</th>
                                                        )}
                                                    </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-sidebar-border">
                                                    {rawItems.map((item: any, index: number) => {
                                                        const reqQty = parseFloat(item.quantity ?? 0);
                                                        const appQty = parseFloat(item.approved_qty ?? 0);

                                                        // Handle Name and Price/Total for display
                                                        let displayName: React.ReactNode = 'Unknown';
                                                        let itemCategory = 'General';
                                                        const iPrice = parseFloat(item.unit_price || item.item?.unit_price || 0);

                                                        // LOGIC: Use Approved if > 0, otherwise fallback to requested
                                                        const finalQty = appQty > 0 ? appQty : reqQty;
                                                        const iTotal = finalQty * iPrice;

                                                        const isModified = appQty > 0 && appQty !== reqQty;

                                                        if (isServiceRequisition) {
                                                            // Service Logic (Simplified Job Request)
                                                            const serviceName = item.service_name || item.service?.name || item.name || 'Unknown Service';
                                                            displayName = <div className="font-medium">{serviceName}</div>;
                                                            itemCategory = 'Service';

                                                        } else {
                                                            // Standard Item Logic
                                                            const itemName = item.name || item.item?.name || 'Unknown Item';
                                                            displayName = <div className="font-medium">{itemName}</div>;
                                                            itemCategory = item.category || item.item?.category?.name || 'General';
                                                        }

                                                        return (
                                                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-sidebar">
                                                                <td className="py-3 px-4 text-gray-500">{index + 1}</td>

                                                                {/* Qty Cell (Present ONLY for Items) */}
                                                                {!isServiceRequisition && (
                                                                    <td className={`py-3 px-4 font-bold ${isModified ? 'text-gray-400 line-through decoration-red-400' : 'text-blue-600'}`}>
                                                                        {reqQty}
                                                                    </td>
                                                                )}

                                                                {showApprovedColumn && (
                                                                    <td className="py-3 px-4 font-bold text-teal-600 bg-teal-50/50 dark:bg-teal-900/5">
                                                                        {isModified ? appQty : '-'}
                                                                    </td>
                                                                )}
                                                                <td className="py-3 px-4 text-gray-900 dark:text-white">
                                                                    {displayName}
                                                                </td>

                                                                {/* Item-Specific Columns */}
                                                                {!isServiceRequisition ? (
                                                                    <>
                                                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-sidebar border border-sidebar-border">
                                                                                {itemCategory}
                                                                            </span>
                                                                        </td>
                                                                        <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                                                                            {formatCurrency(iPrice)}
                                                                        </td>
                                                                        <td className="py-3 px-4 text-right font-bold text-green-600 dark:text-green-400">
                                                                            {formatCurrency(iTotal)}
                                                                        </td>
                                                                    </>
                                                                ) : (
                                                                    // For Services, show Hourly Rate instead of cost columns
                                                                    <td colSpan={1} className="py-3 px-4 text-purple-600 dark:text-purple-400 font-medium">
                                                                        {formatHourlyRate(iPrice)}
                                                                    </td>
                                                                )}
                                                            </tr>
                                                        );
                                                    })}
                                                    {rawItems.length === 0 && (
                                                        <tr>
                                                            {/* Colspan calculation:
                                                            Items: 1 (#) + 1 (Qty) + (1 if Approved shown) + 1 (Name) + 1 (Cat) + 1 (Price) + 1 (Total)
                                                            Services: 1 (#) + (1 if Approved shown) + 1 (Name) + 1 (Rate) = 3 + (1 if Approved shown)
                                                            */}
                                                            <td colSpan={isServiceRequisition ? (showApprovedColumn ? 4 : 3) : (showApprovedColumn ? 7 : 6)} className="py-4 text-center text-gray-500 italic">No items found.</td>
                                                        </tr>
                                                    )}
                                                    </tbody>

                                                    {/* FOOTER TOTAL (Hidden for Services) */}
                                                    {!isServiceRequisition && (
                                                        <tfoot className="bg-gray-50 dark:bg-sidebar border-t border-sidebar-border">
                                                        <tr>
                                                            {/* Colspan adjustment: # (1) + Qty (1) + Approved (1) + Name (1) + Category (1) = 5 columns */}
                                                            <td colSpan={showApprovedColumn ? 5 : 4} className="py-3 px-4 text-left font-medium text-gray-900 dark:text-white">
                                                                Grand Total:
                                                            </td>
                                                            <td colSpan={2} className="py-3 px-4 text-right text-lg font-bold text-green-600 dark:text-green-400">
                                                                {formatCurrency(finalSummaryCost)}
                                                            </td>
                                                        </tr>
                                                        </tfoot>
                                                    )}
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex-shrink-0 p-6 border-t border-sidebar-border bg-gray-50 dark:bg-sidebar-accent">
                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-3">
                                                {renderLeftButtons()}
                                            </div>

                                            <div className="flex gap-3">
                                                {renderRightButtons()}
                                            </div>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            <DeclineReasonModal isOpen={showDeclineModal} onClose={() => setShowDeclineModal(false)} onConfirm={handleDecline} />
        </>
    );
}

// --- HELPER FUNCTIONS ---
function RequisitionStatusIcon({ status }: { status: string }) {
    const safeStatus = (status || 'pending').toLowerCase();
    switch (safeStatus) {
        case 'pending': return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'approved':
        case 'partially_approved':
            return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'rejected': return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
        case 'awaiting_pickup': return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
        case 'ordered': return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
        case 'completed': return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
        default: return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
}

function getStatusDisplayName(status: string): string {
    const statusMap: { [key: string]: string } = { 'pending': 'Pending', 'approved': 'Approved', 'rejected': 'Rejected', 'partially_approved': 'Partially Approved', 'ordered': 'Ordered', 'delivered': 'Delivered', 'awaiting_pickup': 'Awaiting Pickup', 'completed': 'Completed' };
    return statusMap[(status || '').toLowerCase()] || status;
}

function getTypeDisplayName(type: string): string {
    const typeMap: { [key: string]: string } = { 'items': 'Items', 'services': 'Services' };
    return typeMap[(type || '').toLowerCase()] || type;
}
