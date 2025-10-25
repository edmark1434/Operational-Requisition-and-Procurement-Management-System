import { Link } from '@inertiajs/react';
import { requisitionform } from '@/routes';
import { StatusIcons, PriorityIcons } from './utils/icons';
import { getStatusColor, getPriorityColor } from './utils/styleUtils';
import { formatCurrency, formatDate } from './utils/formatters';

interface RequisitionsListProps {
    requisitions: any[];
    onRequisitionClick: (requisition: any) => void;
}

export default function RequisitionsList({ requisitions, onRequisitionClick }: RequisitionsListProps) {
    if (requisitions.length === 0) {
        return (
            <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border bg-sidebar dark:bg-sidebar">
                <div className="h-full overflow-y-auto">
                    <div className="p-4 text-center py-12">
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
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border bg-sidebar dark:bg-sidebar">
            <div className="h-full overflow-y-auto">
                <div className="p-4">
                    <div className="space-y-3">
                        {requisitions.map((requisition) => (
                            <RequisitionListItem
                                key={requisition.ID}
                                requisition={requisition}
                                onClick={() => onRequisitionClick(requisition)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function RequisitionListItem({ requisition, onClick }: { requisition: any; onClick: () => void }) {
    return (
        <div
            onClick={onClick}
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
    );
}
