interface SelectApprovedRequisitionProps {
    formData: {
        REQUISITION_ID: string;
    };
    selectedRequisition: any;
    approvedRequisitions: any[];
    errors: { [key: string]: string };
    onRequisitionChange: (requisitionId: string) => void;
    isEditMode: boolean;
}

export default function SelectApprovedRequisition({
                                                      formData,
                                                      selectedRequisition,
                                                      approvedRequisitions,
                                                      errors,
                                                      onRequisitionChange,
                                                      isEditMode
                                                  }: SelectApprovedRequisitionProps) {
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

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-2">
                Select Approved Requisition <span className="text-red-500">*</span>
            </h3>

            {approvedRequisitions.length === 0 ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                            No approved requisitions found. Purchase orders can only be created from approved requisitions.
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    <div>
                        <select
                            required
                            value={formData.REQUISITION_ID}
                            onChange={(e) => onRequisitionChange(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                errors.REQUISITION_ID ? 'border-red-500' : 'border-sidebar-border'
                            }`}
                            disabled={isEditMode}
                        >
                            <option value="">Select an approved requisition</option>
                            {approvedRequisitions.map(requisition => (
                                <option key={requisition.ID} value={requisition.ID}>
                                    Req #{requisition.ID} - {requisition.REQUESTOR} - {formatDate(requisition.CREATED_AT)}
                                </option>
                            ))}
                        </select>
                        {errors.REQUISITION_ID && (
                            <p className="text-red-500 text-xs mt-1">{errors.REQUISITION_ID}</p>
                        )}
                        {isEditMode && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Requisition cannot be changed in edit mode
                            </p>
                        )}
                    </div>

                    {/* Requisition Details */}
                    {selectedRequisition && (
                        <div className="bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border p-4">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                                Requisition Details
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">Requestor:</span>
                                    <p className="font-medium">{selectedRequisition.REQUESTOR}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">Priority:</span>
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                        selectedRequisition.PRIORITY === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                            selectedRequisition.PRIORITY === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                    }`}>
                                        {selectedRequisition.PRIORITY}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">Date:</span>
                                    <p>{formatDate(selectedRequisition.CREATED_AT)}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">Items:</span>
                                    <p>{selectedRequisition.ITEMS.length}</p>
                                </div>
                            </div>
                            {selectedRequisition.NOTES && (
                                <div className="mt-3">
                                    <span className="text-gray-600 dark:text-gray-400">Notes:</span>
                                    <p className="text-sm mt-1">{selectedRequisition.NOTES}</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
