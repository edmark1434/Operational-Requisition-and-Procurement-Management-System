import { useState } from 'react';

interface DeclineReasonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}

export default function DeclineReasonModal({ isOpen, onClose, onConfirm }: DeclineReasonModalProps) {
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-100">
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
