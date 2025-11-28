import { Link } from '@inertiajs/react';
import { getServiceCategoryColor, getPriceLevelColor } from './utils/styleUtils';
import { formatCurrency, formatHourlyRate } from './utils/formatters';
import { LoaderCircle, Settings, Edit, Clock } from 'lucide-react';

interface ServiceListProps {
    services: any[];
    onServiceClick: (service: any, editing?: boolean) => void;
    viewMode: 'comfortable' | 'compact' | 'condensed';
    isLoading?: boolean;
}

export default function ServiceList({ services, onServiceClick, viewMode, isLoading = false }: ServiceListProps) {
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-8">
                <div className="flex items-center justify-center">
                    <LoaderCircle className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">Loading services...</span>
                </div>
            </div>
        );
    }

    if (services.length === 0) {
        return (
            <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border bg-sidebar dark:bg-sidebar">
                <div className="h-full overflow-y-auto">
                    <div className="p-4 text-center py-12">
                        <div className="text-gray-400 dark:text-gray-600 mb-4">
                            <Settings className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No services found</h3>
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
                    <div className="col-span-3">Service</div>
                    <div className="col-span-2">Category</div>
                    <div className="col-span-2">Vendor</div>
                    <div className="col-span-2 text-right">Hourly Rate</div>
                    <div className="col-span-3 text-right">Actions</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-sidebar-border">
                    {services.map((service) => {

                        return (
                            <div
                                key={service.id}
                                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-sidebar transition-colors cursor-pointer"
                                onClick={() => onServiceClick(service)}
                            >
                                {/* Service Info */}
                                <div className="col-span-3 flex items-center space-x-3">
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {service.name}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            #{service.id}
                                        </div>
                                    </div>
                                </div>

                                {/* Category */}
                                <div className="col-span-2 flex items-center">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getServiceCategoryColor(service.category)}`}>
                                        {service.category}
                                    </span>
                                </div>

                                {/* Vendor */}
                                <div className="col-span-2 flex items-center">
                                    <span className="text-sm text-gray-900 dark:text-white truncate">
                                        {service.vendor ?? 'None assigned'}
                                    </span>
                                </div>

                                {/*/!* Status *!/*/}
                                {/*<div className="col-span-1 flex items-center justify-center">*/}
                                {/*    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getServiceStatusColor(status)}`}>*/}
                                {/*        {ServiceStatusIcons[status as keyof typeof ServiceStatusIcons]}*/}
                                {/*        {statusText}*/}
                                {/*    </div>*/}
                                {/*</div>*/}

                                {/* Hourly Rate */}
                                <div className="col-span-2 flex items-center justify-end">
                                    <span className={`text-sm font-bold ${getPriceLevelColor(service.hourly_rate)}`}>
                                        {formatHourlyRate(service.hourly_rate)}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="col-span-3 flex items-center justify-end space-x-2">
                                    <Link
                                        href={`/services/${service.id}/edit`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 rounded"
                                        title="Edit Service"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
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
                    {services.map((service) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            onClick={() => onServiceClick(service)}
                            viewMode={viewMode}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Service Card Component for Comfortable and Compact views
function ServiceCard({ service, onClick, viewMode }: {
    service: any;
    onClick: () => void;
    viewMode: 'comfortable' | 'compact';
}) {
    if (viewMode === 'compact') {
        return (
            <div className="border border-sidebar-border rounded-lg bg-white dark:bg-sidebar-accent p-3 hover:shadow-md transition-all duration-200 cursor-pointer group">
                {/* Compact Header */}
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        #{service.id}
                    </span>
                    <Link
                        href={`/services/${service.id}/edit`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1"
                    >
                        <Edit className="w-3 h-3" />
                    </Link>
                </div>

                {/* Service Name - Compact */}
                <h3
                    className="font-medium text-sm text-gray-900 dark:text-white mb-1 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={onClick}
                >
                    {service.name}
                </h3>

                {/* Category - Compact */}
                <div className="mb-2">
                    <span className="inline-block px-1.5 py-0.5 rounded text-xs bg-gray-100 dark:bg-sidebar text-gray-600 dark:text-gray-400">
                        {service.category}
                    </span>
                </div>

                {/* Vendor and Rate - Compact */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Vendor:</span>
                        <span className="font-semibold text-gray-900 dark:text-white truncate ml-1">
                            {service.vendor ?? 'None assigned'}
                        </span>
                    </div>

                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Rate:</span>
                        <span className={`font-semibold ${getPriceLevelColor(service.hourly_rate)}`}>
                            {formatCurrency(service.hourly_rate)}/hr
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
            <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-sidebar px-2 py-1 rounded">
                    #{service.id}
                </span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Link
                        href={`/services/${service.id}/edit`}
                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded"
                    >
                        <Edit className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Service Name */}
            <h3
                className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400"
                onClick={onClick}
            >
                {service.name}
            </h3>

            {/* Description */}
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                {service.description}
            </div>

            {/* Category Badge */}
            <div className="mb-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getServiceCategoryColor(service.category)}`}>
                    {service.category}
                </span>
            </div>

            {/* Service Info */}
            <div className="space-y-2">
                {/* Vendor */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Vendor:</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {service.vendor ?? 'None assigned'}
                    </span>
                </div>

                {/* Hourly Rate */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Hourly Rate:</span>
                    <span className={`text-sm font-bold ${getPriceLevelColor(service.hourly_rate)}`}>
                        {formatHourlyRate(service.hourly_rate)}
                    </span>
                </div>

                {/* Contact Info */}
                <div className="flex justify-between items-center pt-2 border-t border-sidebar-border">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Contact:</span>
                    <span className="text-sm text-blue-600 dark:text-blue-400 truncate">
                        {service.vendor_contact_num ?? service.vendor_email ?? 'No contact info'}
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
                    Hourly Service
                </div>
            </div>
        </div>
    );
}
