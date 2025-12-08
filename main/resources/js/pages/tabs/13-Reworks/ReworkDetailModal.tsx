import { useState, useRef, useEffect } from 'react';
import { ReworkStatusIcons } from './utils/icons';
import { getReworkStatusColor } from './utils/styleUtils';
import { formatCurrency, formatDate } from './utils/formatters';

interface ReworkDetailModalProps {
    rework: any;
    isOpen: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: (id: number) => void;
    onStatusChange: (id: number, newStatus: string) => void;
}

// Helper to capitalize status display
const capitalizeStatus = (status: string) => {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : '';
};

// UPDATED: Status Options to match Returns
const statusOptions = [
    {
        value: 'Pending',
        label: 'Pending',
        description: 'Rework request is created'
    },
    {
        value: 'Issued',
        label: 'Issued',
        description: 'When manager sends rework request to supplier'
    },
    {
        value: 'Rejected',
        label: 'Rejected',
        description: 'When rework is rejected by supplier'
    },
    {
        value: 'Delivered',
        label: 'Delivered',
        description: 'When services are reworked'
    }
];

export default function ReworkDetailModal({
                                              rework,
                                              isOpen,
                                              onClose,
                                              onEdit,
                                              onDelete,
                                              onStatusChange
                                          }: ReworkDetailModalProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleDelete = () => {
        if (rework) {
            onDelete(rework.ID);
        }
        setShowDeleteConfirm(false);
    };

    const handleStatusChange = (newStatus: string) => {
        if (rework) {
            onStatusChange(rework.ID, newStatus);
        }
        setShowStatusDropdown(false);
    };

    // Click outside to close dropdown
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

    const isPending = rework?.STATUS?.toLowerCase() === 'pending';

    return (
        <>
            {/* UPDATED: Added backdrop-blur-sm */}
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-sidebar rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-sidebar-border shadow-2xl">
                    {/* Header - Sticky */}
                    <div className="flex-shrink-0 p-6 border-b border-sidebar-border bg-white dark:bg-sidebar sticky top-0 z-10 rounded-t-xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Rework #{rework?.ID} Details
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
                                    {/* STATUS DROPDOWN SECTION */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Status
                                        </label>
                                        <div className="flex items-center gap-2">
                                            {/* Status Badge */}
                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getReworkStatusColor(rework?.STATUS)}`}>
                                                {/* Note: Ensure ReworkStatusIcons has keys for 'issued' and 'delivered' or handle fallbacks */}
                                                {ReworkStatusIcons[rework?.STATUS?.toLowerCase() as keyof typeof ReworkStatusIcons] || ReworkStatusIcons.pending}
                                                {rework?.STATUS}
                                            </div>

                                            {/* Only show Dropdown if NOT Pending */}
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

                                                    {/* Dropdown Menu */}
                                                    {showStatusDropdown && (
                                                        <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg shadow-lg z-20">
                                                            <div className="p-3">
                                                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                                                                    Update Status
                                                                </div>
                                                                <div className="space-y-1">
                                                                    {statusOptions.map((status) => (
                                                                        <button
                                                                            key={status.value}
                                                                            onClick={() => handleStatusChange(status.value)}
                                                                            className={`w-full text-left px-3 py-3 text-sm flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-sidebar-accent transition-colors rounded-md ${
                                                                                rework?.STATUS === status.value
                                                                                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                                                                    : 'border border-transparent'
                                                                            }`}
                                                                        >
                                                                            <div className="flex items-center gap-3 flex-1">
                                                                                <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                                                                                    rework?.STATUS === status.value
                                                                                        ? 'bg-blue-600 dark:bg-blue-400'
                                                                                        : 'bg-gray-300 dark:bg-gray-600'
                                                                                }`}>
                                                                                    {rework?.STATUS === status.value && (
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
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Supplier
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                                            {rework?.SUPPLIER_NAME}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            PO Reference
                                        </label>
                                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                            #{rework?.PO_ID}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Created Date
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {formatDate(rework?.CREATED_AT)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Services Count
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {rework?.SERVICES?.length || 0} service(s)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Remarks */}
                            <div className="border-t border-sidebar-border pt-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Remarks
                                </label>
                                <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-sidebar-accent p-3 rounded-lg border border-sidebar-border">
                                    {rework?.REMARKS || 'No remarks provided'}
                                </p>
                            </div>

                            {/* Services List */}
                            <div className="border-t border-sidebar-border pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Associated Services ({rework?.SERVICES?.length || 0})
                                </h3>
                                <div className="space-y-3">
                                    {rework?.SERVICES?.map((service: any, index: number) => (
                                        <div key={service.ID} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {service.NAME}
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    {service.DESCRIPTION}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {formatCurrency(service.HOURLY_RATE)}/hr
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer with Actions */}
                    <div className="flex-shrink-0 p-6 border-t border-sidebar-border bg-gray-50 dark:bg-sidebar-accent rounded-b-xl">
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete Rework
                            </button>

                            {/* UPDATED: Buttons for Pending Status */}
                            <div className="flex gap-3">
                                {isPending ? (
                                    <>
                                        <button
                                            onClick={onEdit}
                                            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => handleStatusChange('Rejected')}
                                            className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                        >
                                            Reject Slip
                                        </button>

                                        <button
                                            onClick={() => handleStatusChange('Issued')}
                                            className="px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                        >
                                            Issue Slip
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={onEdit}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit Rework
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                // UPDATED: Added backdrop-blur-sm
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white dark:bg-sidebar rounded-xl max-w-md w-full border border-sidebar-border shadow-xl">
                        <div className="p-6 border-b border-sidebar-border">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Delete Rework
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Are you sure you want to delete rework #{rework?.ID}? This action cannot be undone.
                            </p>
                        </div>
                        <div className="p-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                            >
                                Delete Rework
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
