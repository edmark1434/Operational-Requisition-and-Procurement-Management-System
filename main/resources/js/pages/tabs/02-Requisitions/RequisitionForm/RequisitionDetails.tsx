interface RequisitionDetailsProps {
    priority: string;
    setPriority: (priority: string) => void;
    notes: string;
    setNotes: (notes: string) => void;
}

export default function RequisitionDetails({
                                               priority,
                                               setPriority,
                                               notes,
                                               setNotes
                                           }: RequisitionDetailsProps) {
    return (
        <div className="p-4 border border-gray-200 dark:border-sidebar-border rounded-lg bg-gray-50 dark:bg-sidebar">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Requisition Details
            </h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Priority
                    </label>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-sidebar-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-sidebar-accent text-gray-900 dark:text-white"
                    >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-sidebar-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-sidebar-accent text-gray-900 dark:text-white"
                        placeholder="Additional notes or comments..."
                    />
                </div>
            </div>
        </div>
    );
}
