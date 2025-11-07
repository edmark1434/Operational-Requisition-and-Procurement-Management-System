
import { useState } from 'react';
import { getStatusColor, getStatusDisplayName } from '../utils/purchaseCalculations';

interface StatusEditModalProps {
    currentStatus: string;
    onStatusChange: (newStatus: string) => void;
    onCancel: () => void;
}

export default function StatusEditModal({
                                            currentStatus,
                                            onStatusChange,
                                            onCancel
                                        }: StatusEditModalProps) {
    const [selectedStatus, setSelectedStatus] = useState(currentStatus);

    const statusOptions = [
        { value: 'pending_approval', label: 'Pending Approval', description: 'Waiting for approval from management' },
        { value: 'approved', label: 'Approved', description: 'Order has been approved and can proceed' },
        { value: 'rejected', label: 'Rejected', description: 'Order has been rejected' },
        { value: 'sent_dispatched', label: 'Sent & Dispatched', description: 'Order has been sent to supplier' },
        { value: 'closed', label: 'Closed', description: 'Order is complete and closed' }
    ];

    const handleConfirm = () => {
        if (selectedStatus !== currentStatus) {
            onStatusChange(selectedStatus);
        } else {
            onCancel();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-sidebar rounded-xl max-w-md w-full border border-sidebar-border">
                <div className="p-6 border-b border-sidebar-border">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Change Order Status
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Update the status of this purchase order
                    </p>
                </div>

                <div className="p-6 space-y-4">
                    {/* Current Status */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Status:</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentStatus)}`}>
                            {getStatusDisplayName(currentStatus)}
                        </span>
                    </div>

                    {/* Status Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            New Status:
                        </label>
                        <div className="space-y-2">
                            {statusOptions.map((status) => (
                                <label
                                    key={status.value}
                                    className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                                        selectedStatus === status.value
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="status"
                                        value={status.value}
                                        checked={selectedStatus === status.value}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="mt-1 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div className="ml-3 flex-1">
                                        <div className="flex items-center">
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium mr-2 ${getStatusColor(status.value)}`}>
                                                {status.label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {status.description}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Warning for status changes */}
                    {selectedStatus !== currentStatus && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                            <div className="flex items-center">
                                <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                                    Changing status from <strong>{getStatusDisplayName(currentStatus)}</strong> to <strong>{getStatusDisplayName(selectedStatus)}</strong>
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-sidebar-border flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        Confirm Status Change
                    </button>
                </div>
            </div>
        </div>
    );
}
