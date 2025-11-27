import { Link } from '@inertiajs/react';
import { ReworkStatusIcons } from './utils/icons';
import { getReworkStatusColor, getPriceLevelColor } from './utils/styleUtils';
import { formatCurrency, formatDate } from './utils/formatters';
import { LoaderCircle, Settings, Edit, Clock, User } from 'lucide-react';

interface ReworkListProps {
    reworks: any[];
    onReworkClick: (rework: any, editing?: boolean) => void;
    viewMode: 'comfortable' | 'compact' | 'condensed';
    isLoading?: boolean;
}

export default function ReworkList({ reworks, onReworkClick, viewMode, isLoading = false }: ReworkListProps) {
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-8">
                <div className="flex items-center justify-center">
                    <LoaderCircle className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">Loading reworks...</span>
                </div>
            </div>
        );
    }

    if (reworks.length === 0) {
        return (
            <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border bg-sidebar dark:bg-sidebar">
                <div className="h-full overflow-y-auto">
                    <div className="p-4 text-center py-12">
                        <div className="text-gray-400 dark:text-gray-600 mb-4">
                            <Settings className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reworks found</h3>
                        <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (viewMode === 'condensed') {
        return (
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-sidebar border-b border-sidebar-border text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="col-span-2">Rework ID</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-2">Supplier</div>
                    <div className="col-span-2">Services</div>
                    <div className="col-span-1 text-center">Status</div>
                    <div className="col-span-2 text-right">Total Cost</div>
                    <div className="col-span-1 text-right">Actions</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-sidebar-border">
                    {reworks.map((rework) => (
                        <div
                            key={rework.ID}
                            className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-sidebar transition-colors cursor-pointer"
                            onClick={() => onReworkClick(rework)}
                        >
                            {/* Rework ID */}
                            <div className="col-span-2 flex items-center">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    #{rework.ID}
                                </div>
                            </div>

                            {/* Date */}
                            <div className="col-span-2 flex items-center">
                                <span className="text-sm text-gray-900 dark:text-white">
                                    {formatDate(rework.CREATED_AT)}
                                </span>
                            </div>

                            {/* Supplier */}
                            <div className="col-span-2 flex items-center">
                                <span className="text-sm text-gray-900 dark:text-white truncate">
                                    {rework.SUPPLIER_NAME}
                                </span>
                            </div>

                            {/* Services */}
                            <div className="col-span-2 flex items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {rework.SERVICES.length} service(s)
                                </span>
                            </div>

                            {/* Status */}
                            <div className="col-span-1 flex items-center justify-center">
                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getReworkStatusColor(rework.STATUS)}`}>
                                    {ReworkStatusIcons[rework.STATUS as keyof typeof ReworkStatusIcons]}
                                    {rework.STATUS}
                                </div>
                            </div>

                            {/* Total Cost */}
                            <div className="col-span-2 flex items-center justify-end">
                                <span className={`text-sm font-bold ${getPriceLevelColor(rework.TOTAL_COST)}`}>
                                    {formatCurrency(rework.TOTAL_COST)}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="col-span-1 flex items-center justify-end space-x-2">
                                <Link
                                    href={`/reworks/${rework.ID}/edit`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 rounded"
                                    title="Edit Rework"
                                >
                                    <Edit className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border bg-sidebar dark:bg-sidebar">
            <div className="h-full overflow-y-auto p-4">
                <div className={`grid gap-4 ${
                    viewMode === 'comfortable'
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6'
                }`}>
                    {reworks.map((rework) => (
                        <ReworkCard
                            key={rework.ID}
                            rework={rework}
                            onClick={() => onReworkClick(rework)}
                            viewMode={viewMode}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Rework Card Component for Comfortable and Compact views
function ReworkCard({ rework, onClick, viewMode }: {
    rework: any;
    onClick: () => void;
    viewMode: 'comfortable' | 'compact';
}) {
    if (viewMode === 'compact') {
        return (
            <div className="border border-sidebar-border rounded-lg bg-white dark:bg-sidebar-accent p-3 hover:shadow-md transition-all duration-200 cursor-pointer group">
                {/* Compact Header */}
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        #{rework.ID}
                    </span>
                    <Link
                        href={`/reworks/${rework.ID}/edit`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1"
                    >
                        <Edit className="w-3 h-3" />
                    </Link>
                </div>

                {/* Supplier Name - Compact */}
                <div className="flex items-center gap-1 mb-2">
                    <User className="w-3 h-3 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {rework.SUPPLIER_NAME}
                    </span>
                </div>

                {/* Status - Compact */}
                <div className="mb-2">
                    <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${getReworkStatusColor(rework.STATUS)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {rework.STATUS}
                    </div>
                </div>

                {/* Details - Compact */}
                <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Date:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {formatDate(rework.CREATED_AT)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Services:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {rework.SERVICES.length}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Total:</span>
                        <span className={`font-semibold ${getPriceLevelColor(rework.TOTAL_COST)}`}>
                            {formatCurrency(rework.TOTAL_COST)}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // Comfortable View
    return (
        <div className="border border-sidebar-border rounded-lg bg-white dark:bg-sidebar-accent p-4 hover:shadow-md transition-all duration-200 cursor-pointer group">
            {/* Header with ID and Actions */}
            <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-sidebar px-2 py-1 rounded">
                    #{rework.ID}
                </span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Link
                        href={`/reworks/${rework.ID}/edit`}
                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded"
                    >
                        <Edit className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Supplier Info */}
            <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {rework.SUPPLIER_NAME}
                </h3>
            </div>

            {/* Remarks */}
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                {rework.REMARKS}
            </div>

            {/* Status Badge */}
            <div className="mb-3">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getReworkStatusColor(rework.STATUS)}`}>
                    {ReworkStatusIcons[rework.STATUS as keyof typeof ReworkStatusIcons]}
                    {rework.STATUS}
                </div>
            </div>

            {/* Rework Info */}
            <div className="space-y-2">
                {/* Date */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Date:</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatDate(rework.CREATED_AT)}
                    </span>
                </div>

                {/* Services Count */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Services:</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {rework.SERVICES.length} service(s)
                    </span>
                </div>

                {/* Total Cost */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Cost:</span>
                    <span className={`text-sm font-bold ${getPriceLevelColor(rework.TOTAL_COST)}`}>
                        {formatCurrency(rework.TOTAL_COST)}
                    </span>
                </div>

                {/* PO Reference */}
                <div className="flex justify-between items-center pt-2 border-t border-sidebar-border">
                    <span className="text-sm text-gray-600 dark:text-gray-400">PO Reference:</span>
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                        #{rework.PO_ID}
                    </span>
                </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-4 pt-3 border-t border-sidebar-border flex justify-between items-center">
                <button
                    onClick={onClick}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                    View Details
                </button>

                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    {formatDate(rework.CREATED_AT)}
                </div>
            </div>
        </div>
    );
}
