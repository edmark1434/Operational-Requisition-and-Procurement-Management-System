import { PlaceholderPattern } from "@/components/ui/placeholder-pattern";
import AppLayout from '@/layouts/app-layout';
import { requisitions, requisitionform } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

// Import your actual datasets
import requisitionsData from '@/pages/datasets/requisition';
import requisitionItemsData from '@/pages/datasets/requisition_item';
import itemsData from '@/pages/datasets/items';
import categoriesData from '@/pages/datasets/category';
import usersData from '@/pages/datasets/user';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Requisitions',
        href: requisitions().url,
    },
];

// Icons for different statuses
const StatusIcons = {
    approved: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ),
    pending: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    declined: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    draft: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
    )
};

const PriorityIcons = {
    urgent: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
    ),
    high: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
    ),
    normal: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
        </svg>
    ),
    low: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
    )
};

// Transform your actual data to match the component structure
const transformRequisitionData = () => {
    return requisitionsData.map(requisition => {
        const requisitionItems = requisitionItemsData.filter(item => item.REQ_ID === requisition.REQ_ID);
        const requestorUser = usersData.find(user => user.US_ID === requisition.US_ID);

        const itemsWithDetails = requisitionItems.map(reqItem => {
            const itemDetails = itemsData.find(item => item.ITEM_ID === reqItem.ITEM_ID);
            const category = categoriesData.find(cat => cat.CAT_ID === itemDetails?.CATEGORY_ID);
            return {
                NAME: itemDetails?.NAME || 'Unknown Item',
                QUANTITY: reqItem.QUANTITY,
                UNIT_PRICE: itemDetails?.UNIT_PRICE || 0,
                CATEGORY: category?.NAME || reqItem.CATEGORY,
                CATEGORY_ID: category?.CAT_ID
            };
        });

        const totalAmount = itemsWithDetails.reduce((sum, item) =>
            sum + (item.QUANTITY * item.UNIT_PRICE), 0
        );

        // Get all unique categories from items
        const categories = [...new Set(itemsWithDetails.map(item => item.CATEGORY))];

        return {
            ID: requisition.REQ_ID,
            CREATED_AT: requisition.DATE_REQUESTED,
            UPDATED_AT: requisition.DATE_UPDATED,
            STATUS: requisition.STATUS,
            REMARKS: requisition.REASON || '',
            USER_ID: requisition.US_ID,
            REQUESTOR: requisition.REQUESTOR,
            PRIORITY: requisition.PRIORITY,
            NOTES: requisition.NOTES,
            ITEMS: itemsWithDetails,
            CATEGORIES: categories,
            TOTAL_AMOUNT: totalAmount
        };
    });
};

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'approved':
            return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border border-green-200 dark:border-green-800';
        case 'pending':
            return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
        case 'draft':
            return 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
        case 'declined':
        case 'rejected':
            return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800';
        default:
            return 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
    }
};

const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
        case 'urgent':
            return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800';
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

const formatTime = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return 'Invalid Time';
    }
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(amount);
};

// Decline Reason Modal Component
function DeclineReasonModal({ isOpen, onClose, onConfirm }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}) {
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (reason.trim()) {
            onConfirm(reason.trim());
            setReason('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-sidebar rounded-xl max-w-md w-full border border-sidebar-border">
                {/* Header */}
                <div className="p-6 border-b border-sidebar-border">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Decline Requisition
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Please provide a reason for declining this requisition.
                    </p>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Reason for Decline
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 text-sm border border-sidebar-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                placeholder="Enter the reason for declining this requisition..."
                                required
                            />
                        </div>
                    </div>

                    {/* Footer with Actions */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => {
                                setReason('');
                                onClose();
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!reason.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Decline Requisition
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Detail Modal Component
function RequisitionDetailModal({ requisition, isOpen, onClose, onStatusUpdate, onEdit }: {
    requisition: any;
    isOpen: boolean;
    onClose: () => void;
    onStatusUpdate: (id: number, status: string, reason?: string) => void;
    onEdit: (id: number) => void;
}) {
    const [showDeclineModal, setShowDeclineModal] = useState(false);

    const handleApprove = () => {
        onStatusUpdate(requisition.ID, 'Approved');
        onClose();
    };

    const handleDecline = (reason: string) => {
        onStatusUpdate(requisition.ID, 'Declined', reason);
        setShowDeclineModal(false);
        onClose();
    };

    const handlePending = () => {
        onStatusUpdate(requisition.ID, 'Pending');
        onClose();
    };

    const handleEdit = () => {
        onEdit(requisition.ID);
        onClose();
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-sidebar rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-sidebar-border">
                    {/* Header */}
                    <div className="p-6 border-b border-sidebar-border bg-white dark:bg-sidebar">
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

                    {/* Content */}
                    <div className="p-6 space-y-6 bg-white dark:bg-sidebar">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Status
                                    </label>
                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(requisition.STATUS)}`}>
                                        {StatusIcons[requisition.STATUS.toLowerCase() as keyof typeof StatusIcons]}
                                        {requisition.STATUS}
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Total Amount
                                    </label>
                                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                        {formatCurrency(requisition.TOTAL_AMOUNT)}
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

                        {/* Items List */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Requested Items ({requisition.ITEMS.length})
                            </label>
                            <div className="space-y-3">
                                {requisition.ITEMS.map((item: any, index: number) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 border border-sidebar-border rounded-lg bg-white dark:bg-sidebar-accent"
                                    >
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {item.NAME}
                                            </p>
                                            <div className="flex gap-4 mt-1">
                                                <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-sidebar px-2 py-1 rounded border border-sidebar-border">
                                                    {item.CATEGORY}
                                                </span>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    Quantity: {item.QUANTITY}
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    Unit Price: {formatCurrency(item.UNIT_PRICE)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(item.QUANTITY * item.UNIT_PRICE)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer with Actions */}
                    <div className="p-6 border-t border-sidebar-border bg-gray-50 dark:bg-sidebar-accent">
                        <div className="flex justify-between items-center">
                            <div className="flex gap-3">
                                <button
                                    onClick={handleEdit}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Requisition
                                </button>
                            </div>
                            <div className="flex gap-3">
                                {requisition.STATUS === 'Pending' && (
                                    <>
                                        <button
                                            onClick={() => setShowDeclineModal(true)}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Decline
                                        </button>
                                        <button
                                            onClick={handleApprove}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Approve
                                        </button>
                                    </>
                                )}
                                {(requisition.STATUS === 'Approved' || requisition.STATUS === 'Declined') && (
                                    <button
                                        onClick={handlePending}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Set to Pending
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

export default function Requisitions() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [selectedRequisition, setSelectedRequisition] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [requisitions, setRequisitions] = useState(transformRequisitionData());

    const handleStatusUpdate = (id: number, newStatus: string, reason?: string) => {
        setRequisitions(prev =>
            prev.map(req =>
                req.ID === id ? {
                    ...req,
                    STATUS: newStatus,
                    REMARKS: reason || req.REMARKS,
                    UPDATED_AT: new Date().toISOString().slice(0, 19).replace('T', ' ')
                } : req
            )
        );
    };

    const handleEditRequisition = (id: number) => {
        console.log(`Navigating to edit requisition ${id}`);
        alert(`Edit functionality for requisition ${id} would open the Edit Requisition Form page.`);
    };

    // Get all unique categories from all requisitions
    const allCategories = ['All', ...new Set(requisitions.flatMap(req => req.CATEGORIES))];

    const filteredRequisitions = requisitions.filter(requisition => {
        const matchesSearch =
            requisition.REQUESTOR.toLowerCase().includes(searchTerm.toLowerCase()) ||
            requisition.REMARKS.toLowerCase().includes(searchTerm.toLowerCase()) ||
            requisition.NOTES.toLowerCase().includes(searchTerm.toLowerCase()) ||
            requisition.ID.toString().includes(searchTerm) ||
            requisition.ITEMS.some((item: any) =>
                item.NAME.toLowerCase().includes(searchTerm.toLowerCase())
            );

        const matchesStatus = statusFilter === 'All' || requisition.STATUS === statusFilter;
        const matchesPriority = priorityFilter === 'All' || requisition.PRIORITY === priorityFilter;
        const matchesCategory = categoryFilter === 'All' || requisition.CATEGORIES.includes(categoryFilter);

        return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });

    const openModal = (requisition: any) => {
        setSelectedRequisition(requisition);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRequisition(null);
    };

    // Get unique statuses and priorities from actual data
    const statuses = ['All', ...new Set(requisitions.map(req => req.STATUS))];
    const priorities = ['All', ...new Set(requisitions.map(req => req.PRIORITY))];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Requisitions" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Requisitions</h1>
                    <Link
                        href={requisitionform().url}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Requisition
                    </Link>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{requisitions.length}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                    </div>
                    <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {requisitions.filter(req => req.STATUS === 'Approved').length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
                    </div>
                    <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {requisitions.filter(req => req.STATUS === 'Pending').length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
                    </div>
                    <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {requisitions.filter(req => req.STATUS === 'Declined').length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Declined</div>
                    </div>
                </div>

                {/* Enhanced Search and Filters */}
                <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-6">
                    <div className="space-y-4">
                        {/* Enhanced Search */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search requisitions, items, requestors, or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Filters Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Status
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                >
                                    {statuses.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Priority Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Priority
                                </label>
                                <select
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                >
                                    {priorities.map(priority => (
                                        <option key={priority} value={priority}>{priority}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Category Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Category
                                </label>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                >
                                    {allCategories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Results Count */}
                            <div className="flex items-end">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium text-gray-900 dark:text-white">{filteredRequisitions.length}</span> requisitions found
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Responsive Compact Requisitions List */}
                <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border bg-white dark:bg-sidebar">
                    <div className="h-full overflow-y-auto">
                        <div className="p-4">
                            {filteredRequisitions.length > 0 ? (
                                <div className="space-y-3">
                                    {filteredRequisitions.map((requisition) => (
                                        <div
                                            key={requisition.ID}
                                            onClick={() => openModal(requisition)}
                                            className="border border-sidebar-border rounded-lg bg-white dark:bg-sidebar-accent p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300 dark:hover:border-blue-600"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                {/* Left Section - ID and Basic Info */}
                                                <div className="flex items-center space-x-4 min-w-0 flex-1">
                                                    <div className="flex-shrink-0">
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-sidebar px-2 py-1 rounded border border-sidebar-border">
                                                            #{requisition.ID}
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                            {requisition.REQUESTOR}
                                                        </p>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                            {requisition.REMARKS || requisition.NOTES || 'No remarks'}
                                                        </p>
                                                        <div className="flex gap-2 mt-1">
                                                            {requisition.CATEGORIES.slice(0, 2).map((category: string, index: number) => (
                                                                <span key={index} className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-sidebar px-1.5 py-0.5 rounded border border-sidebar-border">
                                                                    {category}
                                                                </span>
                                                            ))}
                                                            {requisition.CATEGORIES.length > 2 && (
                                                                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-sidebar px-1.5 py-0.5 rounded border border-sidebar-border">
                                                                    +{requisition.CATEGORIES.length - 2} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Middle Section - Status and Priority Tags */}
                                                <div className="flex items-center space-x-2 flex-wrap gap-2">
                                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(requisition.STATUS)}`}>
                                                        {StatusIcons[requisition.STATUS.toLowerCase() as keyof typeof StatusIcons]}
                                                        {requisition.STATUS}
                                                    </div>
                                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(requisition.PRIORITY)}`}>
                                                        {PriorityIcons[requisition.PRIORITY.toLowerCase() as keyof typeof PriorityIcons]}
                                                        {requisition.PRIORITY}
                                                    </div>
                                                </div>

                                                {/* Right Section - Amount and Date */}
                                                <div className="flex items-center space-x-4 justify-between sm:justify-end min-w-0">
                                                    <div className="text-right min-w-0">
                                                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400 truncate">
                                                            {formatCurrency(requisition.TOTAL_AMOUNT)}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                                            {formatDate(requisition.CREATED_AT)}
                                                        </p>
                                                    </div>
                                                    <div className="flex-shrink-0 text-gray-400">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-gray-400 dark:text-gray-600 mb-4">
                                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No requisitions found</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your search or filters.</p>
                                    <Link
                                        href={requisitionform().url}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Create Your First Requisition
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Detail Modal */}
                {selectedRequisition && (
                    <RequisitionDetailModal
                        requisition={selectedRequisition}
                        isOpen={isModalOpen}
                        onClose={closeModal}
                        onStatusUpdate={handleStatusUpdate}
                        onEdit={handleEditRequisition}
                    />
                )}
            </div>
        </AppLayout>
    );
}
