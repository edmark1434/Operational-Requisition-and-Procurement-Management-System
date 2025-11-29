import React from 'react';

interface RequisitionStatsProps {
    requisitions: any[];
}

export default function RequisitionStats({ requisitions }: RequisitionStatsProps) {

    // Helper to safely get the status count
    const getCountByStatus = (targetStatus: string) => {
        if (!requisitions) return 0;

        return requisitions.filter(req => {
            // Safe access: Try lowercase 'status', then uppercase 'STATUS'
            const status = req.status || req.STATUS || '';
            return status.toLowerCase() === targetStatus.toLowerCase();
        }).length;
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Pending */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {getCountByStatus('pending')}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </div>

            {/* Approved */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {getCountByStatus('approved')}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
            </div>

            {/* Rejected */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {getCountByStatus('rejected')}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
            </div>

            {/* Received (or Completed) */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {getCountByStatus('received')}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Received</div>
            </div>
        </div>
    );
}
