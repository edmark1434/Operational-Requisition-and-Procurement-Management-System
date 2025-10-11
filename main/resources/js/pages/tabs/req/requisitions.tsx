import { PlaceholderPattern } from "@/components/ui/placeholder-pattern";
import AppLayout from '@/layouts/app-layout';
import { requisitions, requisitionform } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Requisitions',
        href: requisitions().url,
    },
];

// Mock data based on your JSON files
const requisitionData = [
    {
        "ID": 1,
        "CREATED_AT": "2024-05-15T09:00:00Z",
        "UPDATED_AT": "2024-05-15T11:30:00Z",
        "STATUS": "Approved",
        "REMARKS": "Q4 Tech refresh for Marketing team. Needs to be delivered by Friday.",
        "USER_ID": "U001",
        "REQUESTOR": "John Doe",
        "PRIORITY": "High",
        "NOTES": "Urgent request for new marketing campaign",
        "ITEMS": [
            { "NAME": "4K Ultra HD Monitor (27 inch)", "QUANTITY": 2, "UNIT_PRICE": 350.00 },
            { "NAME": "Ergonomic Mechanical Keyboard", "QUANTITY": 2, "UNIT_PRICE": 75.50 }
        ],
        "TOTAL_AMOUNT": 851.00
    },
    {
        "ID": 2,
        "CREATED_AT": "2024-05-15T10:15:00Z",
        "UPDATED_AT": "2024-05-15T10:15:00Z",
        "STATUS": "Pending",
        "REMARKS": "Urgent replacement for a crashed development workstation.",
        "USER_ID": "U002",
        "REQUESTOR": "Jane Smith",
        "PRIORITY": "Urgent",
        "NOTES": "Developer workstation crashed, need immediate replacement",
        "ITEMS": [
            { "NAME": "1TB NVMe SSD Drive", "QUANTITY": 1, "UNIT_PRICE": 120.99 }
        ],
        "TOTAL_AMOUNT": 120.99
    },
    {
        "ID": 3,
        "CREATED_AT": "2024-05-16T14:30:00Z",
        "UPDATED_AT": "2024-05-16T14:30:00Z",
        "STATUS": "Draft",
        "REMARKS": "Initial inventory check for new hires in June.",
        "USER_ID": "U001",
        "REQUESTOR": "John Doe",
        "PRIORITY": "Normal",
        "NOTES": "Preparing for new team members starting next month",
        "ITEMS": [
            { "NAME": "Gel Pen Pack (12 count)", "QUANTITY": 10, "UNIT_PRICE": 15.00 }
        ],
        "TOTAL_AMOUNT": 150.00
    },
    {
        "ID": 4,
        "CREATED_AT": "2024-05-17T08:45:00Z",
        "UPDATED_AT": "2024-05-17T15:00:00Z",
        "STATUS": "Rejected",
        "REMARKS": "Exceeded budget for hardware. Please resubmit with lower-cost alternatives.",
        "USER_ID": "U003",
        "REQUESTOR": "Mike Johnson",
        "PRIORITY": "High",
        "NOTES": "Executive office setup",
        "ITEMS": [
            { "NAME": "Standing Desk Converter", "QUANTITY": 1, "UNIT_PRICE": 180.00 },
            { "NAME": "4K Ultra HD Monitor (27 inch)", "QUANTITY": 1, "UNIT_PRICE": 350.00 }
        ],
        "TOTAL_AMOUNT": 530.00
    },
    {
        "ID": 5,
        "CREATED_AT": "2024-05-17T11:00:00Z",
        "UPDATED_AT": "2024-05-17T11:00:00Z",
        "STATUS": "Pending",
        "REMARKS": "Monthly re-order for general office supplies.",
        "USER_ID": "U002",
        "REQUESTOR": "Jane Smith",
        "PRIORITY": "Low",
        "NOTES": "Regular monthly supplies",
        "ITEMS": [
            { "NAME": "Gel Pen Pack (12 count)", "QUANTITY": 5, "UNIT_PRICE": 15.00 }
        ],
        "TOTAL_AMOUNT": 75.00
    }
];

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'approved':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border border-green-200 dark:border-green-800';
        case 'pending':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
        case 'draft':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border border-gray-200 dark:border-gray-800';
        case 'rejected':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border border-red-200 dark:border-red-800';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border border-gray-200 dark:border-gray-800';
    }
};

const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
        case 'urgent':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border border-red-200 dark:border-red-800';
        case 'high':
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border border-orange-200 dark:border-orange-800';
        case 'normal':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
        case 'low':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border border-green-200 dark:border-green-800';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border border-gray-200 dark:border-gray-800';
    }
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Detail Modal Component
function RequisitionDetailModal({ requisition, isOpen, onClose, onStatusUpdate }: {
    requisition: any;
    isOpen: boolean;
    onClose: () => void;
    onStatusUpdate: (id: number, status: string) => void;
}) {
    if (!isOpen) return null;

    const handleApprove = () => {
        onStatusUpdate(requisition.ID, 'Approved');
        onClose();
    };

    const handleReject = () => {
        onStatusUpdate(requisition.ID, 'Rejected');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Requisition #{requisition.ID} Details
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Status
                                </label>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(requisition.STATUS)}`}>
                                    {requisition.STATUS}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Priority
                                </label>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(requisition.PRIORITY)}`}>
                                    {requisition.PRIORITY}
                                </span>
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
                                    ${requisition.TOTAL_AMOUNT.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Remarks & Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Remarks
                            </label>
                            <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                                {requisition.REMARKS}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Notes
                            </label>
                            <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                                {requisition.NOTES}
                            </p>
                        </div>
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
                                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
                                >
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {item.NAME}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            Quantity: {item.QUANTITY} × ${item.UNIT_PRICE.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                            ${(item.QUANTITY * item.UNIT_PRICE).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer with Actions */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                    <div className="flex justify-between items-center">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                            Close
                        </button>
                        {requisition.STATUS === 'Pending' && (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleReject}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={handleApprove}
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                                >
                                    Approve
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Requisitions() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [selectedRequisition, setSelectedRequisition] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [requisitions, setRequisitions] = useState(requisitionData);

    const handleStatusUpdate = (id: number, newStatus: string) => {
        setRequisitions(prev =>
            prev.map(req =>
                req.ID === id ? { ...req, STATUS: newStatus, UPDATED_AT: new Date().toISOString() } : req
            )
        );
    };

    const filteredRequisitions = requisitions.filter(requisition => {
        const matchesSearch =
            requisition.REQUESTOR.toLowerCase().includes(searchTerm.toLowerCase()) ||
            requisition.REMARKS.toLowerCase().includes(searchTerm.toLowerCase()) ||
            requisition.ID.toString().includes(searchTerm) ||
            requisition.ITEMS.some((item: any) =>
                item.NAME.toLowerCase().includes(searchTerm.toLowerCase())
            );

        const matchesStatus = statusFilter === 'All' || requisition.STATUS === statusFilter;
        const matchesPriority = priorityFilter === 'All' || requisition.PRIORITY === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    const openModal = (requisition: any) => {
        setSelectedRequisition(requisition);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRequisition(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Requisitions" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Requisitions</h1>
                    <Link
                        href={requisitionform().url}
                        className="rounded-lg bg-green-800 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                    >
                        Make a Request
                    </Link>
                </div>

                {/* Enhanced Search and Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
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
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Status
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="All">All Status</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
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
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="All">All Priority</option>
                                    <option value="Low">Low</option>
                                    <option value="Normal">Normal</option>
                                    <option value="High">High</option>
                                    <option value="Urgent">Urgent</option>
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
                <div className="flex-1 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="h-full overflow-y-auto">
                        <div className="p-4">
                            {filteredRequisitions.length > 0 ? (
                                <div className="space-y-3">
                                    {filteredRequisitions.map((requisition) => (
                                        <div
                                            key={requisition.ID}
                                            onClick={() => openModal(requisition)}
                                            className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300 dark:hover:border-blue-600"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                {/* Left Section - ID and Basic Info */}
                                                <div className="flex items-center space-x-4 min-w-0 flex-1">
                                                    <div className="flex-shrink-0">
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                            #{requisition.ID}
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                            {requisition.REQUESTOR}
                                                        </p>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                            {requisition.REMARKS}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Middle Section - Status and Priority Tags */}
                                                <div className="flex items-center space-x-2 flex-wrap gap-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(requisition.STATUS)}`}>
                                                        {requisition.STATUS}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(requisition.PRIORITY)}`}>
                                                        {requisition.PRIORITY}
                                                    </span>
                                                </div>

                                                {/* Right Section - Amount and Date */}
                                                <div className="flex items-center space-x-4 justify-between sm:justify-end min-w-0">
                                                    <div className="text-right min-w-0">
                                                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400 truncate">
                                                            ${requisition.TOTAL_AMOUNT.toLocaleString()}
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
                    />
                )}
            </div>
        </AppLayout>
    );
}
