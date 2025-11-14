import AppLayout from '@/layouts/app-layout';
import { audit } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Calendar,
    User,
    FileText,
    Shield,
    Package,
    ShoppingCart,
    Truck,
    CheckCircle,
    AlertTriangle,
    Download,
    RefreshCw
} from 'lucide-react';
import { LucideProps } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Audit Logs',
        href: audit().url,
    },
];

interface AuditLog {
    id: number;
    type: string;
    description: string;
    created_at: string;
    user_id: number;
    user_name?: string;
}

interface ActivityIconProps {
    type: string;
}

const ActivityIcon = ({ type }: ActivityIconProps) => {
    const iconConfig: Record<string, { icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>; color: string }> = {
        'user_login': { icon: User, color: 'blue' },
        'user_created': { icon: User, color: 'green' },
        'user_updated': { icon: User, color: 'yellow' },
        'user_deleted': { icon: User, color: 'red' },
        'requisition_created': { icon: ShoppingCart, color: 'purple' },
        'requisition_approved': { icon: CheckCircle, color: 'green' },
        'requisition_declined': { icon: AlertTriangle, color: 'red' },
        'delivery_created': { icon: Truck, color: 'orange' },
        'delivery_completed': { icon: CheckCircle, color: 'green' },
        'inventory_updated': { icon: Package, color: 'blue' },
        'permission_updated': { icon: Shield, color: 'purple' },
        'system_event': { icon: FileText, color: 'gray' }
    };

    const config = iconConfig[type] || { icon: FileText, color: 'gray' };
    const Icon = config.icon;

    return (
        <div className={`p-2 rounded-lg ${
            config.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20' :
                config.color === 'green' ? 'bg-green-50 dark:bg-green-900/20' :
                    config.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                        config.color === 'red' ? 'bg-red-50 dark:bg-red-900/20' :
                            config.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20' :
                                config.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20' :
                                    'bg-gray-50 dark:bg-gray-900/20'
        }`}>
            <Icon className={`h-4 w-4 ${
                config.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    config.color === 'green' ? 'text-green-600 dark:text-green-400' :
                        config.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                            config.color === 'red' ? 'text-red-600 dark:text-red-400' :
                                config.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                                    config.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                                        'text-gray-600 dark:text-gray-400'
            }`} />
        </div>
    );
};

const StatusBadge = ({ type }: { type: string }) => {
    const typeConfig: Record<string, { color: string; label: string }> = {
        'user_login': { color: 'blue', label: 'Login' },
        'user_created': { color: 'green', label: 'User Created' },
        'user_updated': { color: 'yellow', label: 'User Updated' },
        'user_deleted': { color: 'red', label: 'User Deleted' },
        'requisition_created': { color: 'purple', label: 'Requisition' },
        'requisition_approved': { color: 'green', label: 'Approved' },
        'requisition_declined': { color: 'red', label: 'Declined' },
        'delivery_created': { color: 'orange', label: 'Delivery' },
        'delivery_completed': { color: 'green', label: 'Completed' },
        'inventory_updated': { color: 'blue', label: 'Inventory' },
        'permission_updated': { color: 'purple', label: 'Permissions' },
        'system_event': { color: 'gray', label: 'System' }
    };

    const config = typeConfig[type] || { color: 'gray', label: type };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            config.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                config.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    config.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        config.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            config.color === 'purple' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                config.color === 'orange' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }`}>
            {config.label}
        </span>
    );
};

export default function AuditLogs() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('All');

    // Available types for filter
    const availableTypes = ['All', 'user_login', 'user_created', 'user_updated', 'user_deleted',
        'requisition_created', 'requisition_approved', 'requisition_declined',
        'delivery_created', 'delivery_completed', 'inventory_updated',
        'permission_updated', 'system_event'];

    const dateRanges = ['All', 'Today', 'Last 7 days', 'Last 30 days', 'Last 90 days'];

    // Load audit logs on component mount
    useEffect(() => {
        loadAuditLogs();
    }, []);

    // Filter logs based on search and filters
    useEffect(() => {
        const filtered = logs.filter(log => {
            const matchesSearch = searchTerm === '' ||
                log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.user_name?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesType = typeFilter === 'All' || log.type === typeFilter;

            const matchesDate = dateFilter === 'All' || isInDateRange(log.created_at, dateFilter);

            return matchesSearch && matchesType && matchesDate;
        });
        setFilteredLogs(filtered);
    }, [logs, searchTerm, typeFilter, dateFilter]);

    const loadAuditLogs = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            const transformedLogs = transformAuditLogData();
            setLogs(transformedLogs);
            setIsLoading(false);
        }, 1000);
    };

    const transformAuditLogData = (): AuditLog[] => {
        // Create mock audit log data based on your system
        const mockLogs: AuditLog[] = [
            {
                id: 1,
                type: 'user_login',
                description: 'User logged into the system',
                created_at: '2024-01-20 09:30:00',
                user_id: 2001,
                user_name: 'John Doe'
            },
            {
                id: 2,
                type: 'requisition_created',
                description: 'Created new requisition #5004 for office supplies',
                created_at: '2024-01-20 10:15:00',
                user_id: 2002,
                user_name: 'Maria Garcia'
            },
            {
                id: 3,
                type: 'requisition_approved',
                description: 'Approved requisition #5001 for maintenance department',
                created_at: '2024-01-20 11:30:00',
                user_id: 2001,
                user_name: 'John Doe'
            },
            {
                id: 4,
                type: 'delivery_completed',
                description: 'Delivery #REC-2024-004 completed successfully',
                created_at: '2024-01-20 14:20:00',
                user_id: 2003,
                user_name: 'David Johnson'
            },
            {
                id: 5,
                type: 'inventory_updated',
                description: 'Updated stock levels for Power Drill Machine',
                created_at: '2024-01-19 16:45:00',
                user_id: 2004,
                user_name: 'Sarah Wilson'
            },
            {
                id: 6,
                type: 'user_created',
                description: 'Created new user account for Michael Brown',
                created_at: '2024-01-19 13:10:00',
                user_id: 2001,
                user_name: 'John Doe'
            },
            {
                id: 7,
                type: 'permission_updated',
                description: 'Updated user permissions for Maria Garcia',
                created_at: '2024-01-18 15:30:00',
                user_id: 2001,
                user_name: 'John Doe'
            },
            {
                id: 8,
                type: 'requisition_declined',
                description: 'Declined requisition #5002 due to budget constraints',
                created_at: '2024-01-18 11:20:00',
                user_id: 2001,
                user_name: 'John Doe'
            },
            {
                id: 9,
                type: 'user_login',
                description: 'User logged into the system',
                created_at: '2024-01-17 08:45:00',
                user_id: 2003,
                user_name: 'David Johnson'
            },
            {
                id: 10,
                type: 'delivery_created',
                description: 'Created new delivery for Office World Suppliers',
                created_at: '2024-01-16 14:30:00',
                user_id: 2004,
                user_name: 'Sarah Wilson'
            }
        ];

        return mockLogs;
    };

    const isInDateRange = (dateString: string, range: string): boolean => {
        const date = new Date(dateString);
        const now = new Date();

        switch (range) {
            case 'Today':
                return date.toDateString() === now.toDateString();
            case 'Last 7 days':
                const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
                return date >= sevenDaysAgo;
            case 'Last 30 days':
                const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
                return date >= thirtyDaysAgo;
            case 'Last 90 days':
                const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 90));
                return date >= ninetyDaysAgo;
            default:
                return true;
        }
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const exportLogs = () => {
        // In a real application, this would generate and download a CSV file
        alert('Export functionality would be implemented here');
    };

    const refreshLogs = () => {
        loadAuditLogs();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Logs" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={exportLogs}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <button
                            onClick={refreshLogs}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-sidebar dark:bg-sidebar rounded-lg border border-sidebar-border p-6">
                    <div className="space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search audit logs by description or user..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Filters Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Type Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Filter className="w-4 h-4 inline mr-1" />
                                    Activity Type
                                </label>
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                >
                                    {availableTypes.map(type => (
                                        <option key={type} value={type}>
                                            {type === 'All' ? 'All Types' : type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Date Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    Date Range
                                </label>
                                <select
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                >
                                    {dateRanges.map(range => (
                                        <option key={range} value={range}>
                                            {range}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Results Count */}
                            <div className="flex items-end">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium text-gray-900 dark:text-white">{filteredLogs.length}</span> log entries found
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Audit Logs List */}
                <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-sidebar border-b border-sidebar-border text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <div className="col-span-1">Type</div>
                        <div className="col-span-6">Description</div>
                        <div className="col-span-2">User</div>
                        <div className="col-span-3">Date & Time</div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-sidebar-border">
                        {isLoading ? (
                            <div className="px-6 py-8 text-center">
                                <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                                <span className="text-gray-600 dark:text-gray-400">Loading audit logs...</span>
                            </div>
                        ) : filteredLogs.length === 0 ? (
                            <div className="px-6 py-8 text-center">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No audit logs found</h3>
                                <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
                            </div>
                        ) : (
                            filteredLogs.map((log) => (
                                <div
                                    key={log.id}
                                    className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-sidebar-accent transition-colors"
                                >
                                    {/* Type */}
                                    <div className="col-span-1 flex items-center">
                                        <ActivityIcon type={log.type} />
                                    </div>

                                    {/* Description */}
                                    <div className="col-span-6 flex items-center">
                                        <div className="min-w-0">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                                {log.description}
                                            </div>
                                            <StatusBadge type={log.type} />
                                        </div>
                                    </div>

                                    {/* User */}
                                    <div className="col-span-2 flex items-center">
                                        <div className="flex items-center space-x-2">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-900 dark:text-white">
                                                {log.user_name || 'System'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Date & Time */}
                                    <div className="col-span-3 flex items-center">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                {formatDateTime(log.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
