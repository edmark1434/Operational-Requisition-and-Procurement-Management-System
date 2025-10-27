import { useState } from 'react';
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
        router.get(`/requisitions/${requisition.ID}/edit`);
        onClose();
    };

    if (!isOpen) return null;

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
                                {/* REMOVED TOTAL AMOUNT */}
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

                        {/* Items List - UPDATED */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Requested Items ({requisition.ITEMS.length})
                            </label>
                            <div className="space-y-3">
                                {requisition.ITEMS.map((item: any, index: number) => (
                                    <div
                                        key={index}
                                        className="p-4 border border-sidebar-border rounded-lg bg-white dark:bg-sidebar-accent"
                                    >
                                        <div className="flex flex-col space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {item.NAME}
                                                    </p>
                                                    {/* ADDED DESCRIPTION */}
                                                    {item.DESCRIPTION && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                            {item.DESCRIPTION}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-sidebar px-2 py-1 rounded border border-sidebar-border">
                                                    {item.CATEGORY}
                                                </span>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    Quantity: {item.QUANTITY}
                                                </p>
                                                {/* REMOVED UNIT PRICE */}
                                            </div>
                                        </div>
                                        {/* REMOVED PRICE CALCULATION */}
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
