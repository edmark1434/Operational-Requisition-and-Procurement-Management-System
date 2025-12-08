import { Link } from '@inertiajs/react';
import { StatusIcons } from './utils/icons';
import { getStatusColor, getPriorityColor } from './utils/styleUtils';
import { formatDate } from './utils/formatters';

interface Requisition {
    id: number;
    ref_no: string;
    requestor: string;
    priority: string;
    type: string;
    status: string;
    notes: string;
    remarks?: string;
    created_at: string;
    categories: string[];
    items?: any[];
    services?: any[];
    items_count?: number;
    services_count?: number;
}

interface RequisitionsListProps {
    requisitions: Requisition[];
    onRequisitionClick: (requisition: Requisition) => void;
}

export default function RequisitionsList({ requisitions, onRequisitionClick }: RequisitionsListProps) {
    const getStatusDisplayName = (status: string): string => {
        const statusMap: { [key: string]: string } = {
            'pending': 'Pending',
            'approved': 'Approved',
            'rejected': 'Rejected',
            'partially_approved': 'Partially Approved',
            'delivered': 'Delivered',
            'awaiting_pickup': 'Awaiting Pickup',
            'received': 'Received',
            'completed': 'Completed'
        };
        return statusMap[status?.toLowerCase()] || status;
    };

    if (!requisitions || requisitions.length === 0) {
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
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 overflow-hidden rounded-xl border border-sidebar-border bg-sidebar dark:bg-sidebar">
            {/* Column Headers */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-3 border-b border-sidebar-border bg-gray-50 dark:bg-sidebar-accent shrink-0 z-10">
                <div className="col-span-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    REF NO.
                </div>
                <div className="col-span-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    TYPE
                </div>
                <div className="col-span-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    STATUS
                </div>
                <div className="col-span-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    DETAILS
                </div>
                <div className="col-span-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    PRIORITY
                </div>
                <div className="col-span-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                    DATE
                </div>
            </div>

            {/* Scrollable List Body */}
            <div className="flex-1 overflow-y-auto min-h-0">
                <div className="p-4 lg:p-0">
                    <div className="space-y-3 lg:space-y-0">
                        {requisitions.map((requisition: any) => (
                            <RequisitionListItem
                                key={requisition.id || requisition.ID || Math.random()}
                                requisition={requisition}
                                onClick={() => onRequisitionClick(requisition)}
                                getStatusDisplayName={getStatusDisplayName}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function RequisitionListItem({
                                 requisition,
                                 onClick,
                                 getStatusDisplayName
                             }: {
    requisition: any;
    onClick: () => void;
    getStatusDisplayName: (status: string) => string;
}) {
    const id = requisition.id || requisition.ID;
    const referenceNo = requisition.ref_no || requisition.REFERENCES_NO || `#${id}`;
    const status = requisition.status || requisition.STATUS;
    const type = requisition.type || requisition.TYPE;
    const priority = requisition.priority || requisition.PRIORITY;
    const requestor = requisition.requestor || requisition.REQUESTOR;
    const notes = requisition.notes || requisition.NOTES;
    const remarks = requisition.remarks || requisition.REMARKS;
    const categories = requisition.categories || requisition.CATEGORIES || [];
    const date = requisition.created_at || requisition.CREATED_AT;

    const isServiceRequisition = type?.toLowerCase() === 'services';

    // Calculate Counts
    const itemsCount = requisition.items?.length || requisition.items_count || 0;
    const servicesCount = requisition.services?.length || requisition.services_count || 0;

    const displayCount = isServiceRequisition ? servicesCount : itemsCount;
    const displayLabel = isServiceRequisition
        ? (displayCount === 1 ? 'Job' : 'Jobs')
        : (displayCount === 1 ? 'Item' : 'Items');

    return (
        <div onClick={onClick} className="border border-sidebar-border rounded-lg lg:border-0 lg:rounded-none lg:border-b bg-white dark:bg-sidebar p-4 lg:py-3 hover:shadow-md lg:hover:shadow-none transition-all duration-200 cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 lg:hover:bg-gray-50 dark:lg:hover:bg-sidebar">
            <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center">
                <div className="col-span-2 mb-3 lg:mb-0">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-sidebar px-2 py-1 rounded border border-sidebar-border">
                         {referenceNo}
                    </span>
                </div>

                {/* TYPE with RESTORED ICONS */}
                <div className="col-span-2 mb-3 lg:mb-0">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                        isServiceRequisition
                            ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                            : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    }`}>
                        {isServiceRequisition ? (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        )}
                        {isServiceRequisition ? 'Services' : 'Items'}
                    </div>
                </div>

                <div className="col-span-2 mb-3 lg:mb-0">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {StatusIcons[status?.toLowerCase() as keyof typeof StatusIcons] || StatusIcons.pending}
                        {getStatusDisplayName(status)}
                    </div>
                </div>

                {/* DETAILS with COUNT TAGS */}
                <div className="col-span-3 mb-3 lg:mb-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {requestor}
                    </p>

                    {status?.toLowerCase() === 'rejected' && remarks ? (
                        <p className="text-xs text-red-600 dark:text-red-400 truncate mt-1 font-medium">
                            {remarks}
                        </p>
                    ) : (
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
                            {notes || 'No notes'}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-2">
                        {/* ITEM COUNT TAG */}
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-sidebar px-1.5 py-0.5 rounded border border-sidebar-border font-medium">
                            {displayCount} {displayLabel}
                        </span>

                        {categories && categories.length > 0 ? (
                            <>
                                {categories.slice(0, 2).map((category: string, index: number) => (
                                    <span key={index} className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-sidebar px-1.5 py-0.5 rounded border border-sidebar-border">
                                        {category}
                                    </span>
                                ))}
                                {categories.length > 2 && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-sidebar px-1.5 py-0.5 rounded border border-sidebar-border">
                                        +{categories.length - 2} more
                                    </span>
                                )}
                            </>
                        ) : null}
                    </div>
                </div>

                <div className="col-span-2 mb-3 lg:mb-0">
                    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
                        {priority}
                    </div>
                </div>
                <div className="col-span-1 flex items-center justify-between lg:justify-end">
                    <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                            {formatDate(date)}
                        </p>
                    </div>
                    <div className="flex-shrink-0 text-gray-400 ml-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
