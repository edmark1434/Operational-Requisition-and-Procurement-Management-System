import AppLayout from '@/layouts/app-layout';
import { notifications } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notifications',
        href: notifications().url,
    },
];

// Notification dataset based on ORPMS system
const notificationsData = [
    {
        id: 1,
        type: 'requisition',
        title: 'Requisition Approved',
        message: 'Requisition #REQ-001 has been approved and forwarded for processing',
        timestamp: '2024-01-15T10:30:00Z',
        isRead: false,
        referenceId: 'REQ-001',
        redirectTo: '/requisitions'
    },
    {
        id: 2,
        type: 'purchase_order',
        title: 'Purchase Order Issued',
        message: 'Purchase Order #PO-045 has been issued to vendor Tech Supplies Inc.',
        timestamp: '2024-01-15T09:15:00Z',
        isRead: true,
        referenceId: 'PO-045',
        redirectTo: '/purchases'
    },
    {
        id: 3,
        type: 'delivery',
        title: 'Delivery Scheduled',
        message: 'Delivery for PO #PO-044 is scheduled for tomorrow 2:00 PM',
        timestamp: '2024-01-14T16:45:00Z',
        isRead: true,
        referenceId: 'PO-044',
        redirectTo: '/deliveries'
    },
    {
        id: 4,
        type: 'inventory',
        title: 'Low Stock Alert',
        message: 'Network Cable Cat6 is running low on stock. Current quantity: 5 units',
        timestamp: '2024-01-14T14:20:00Z',
        isRead: false,
        referenceId: 'ITEM-782',
        redirectTo: '/inventory'
    },
    {
        id: 5,
        type: 'return',
        title: 'Return Request Created',
        message: 'New return request created for defective switches from delivery #DEL-023',
        timestamp: '2024-01-14T11:10:00Z',
        isRead: true,
        referenceId: 'RET-012',
        redirectTo: '/returns'
    },
    {
        id: 6,
        type: 'user',
        title: 'New User Registration',
        message: 'John Smith has been registered as a new requestor in the system',
        timestamp: '2024-01-14T10:05:00Z',
        isRead: true,
        referenceId: 'USER-089',
        redirectTo: '/users'
    },
    {
        id: 7,
        type: 'service',
        title: 'Service Completion',
        message: 'Network installation service for Requisition #REQ-078 has been completed',
        timestamp: '2024-01-14T09:30:00Z',
        isRead: false,
        referenceId: 'SVC-045',
        redirectTo: '/services'
    },
    {
        id: 8,
        type: 'system',
        title: 'System Maintenance',
        message: 'Scheduled system maintenance will occur this Saturday from 2:00 AM to 4:00 AM',
        timestamp: '2024-01-13T17:00:00Z',
        isRead: true,
        referenceId: 'SYS-001',
        redirectTo: '/settings'
    },
    {
        id: 9,
        type: 'requisition',
        title: 'Requisition Requires Approval',
        message: 'Requisition #REQ-034 is pending your approval',
        timestamp: '2024-01-13T15:20:00Z',
        isRead: false,
        referenceId: 'REQ-034',
        redirectTo: '/requisitions'
    },
    {
        id: 10,
        type: 'purchase_order',
        title: 'Purchase Order Updated',
        message: 'Purchase Order #PO-039 has been updated with new items',
        timestamp: '2024-01-13T14:15:00Z',
        isRead: true,
        referenceId: 'PO-039',
        redirectTo: '/purchases'
    }
];

// Icon components for different notification types
const NotificationIcons = {
    requisition: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    purchase_order: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
    ),
    delivery: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
    ),
    inventory: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
    ),
    return: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
    ),
    user: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
    service: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ),
    system: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    )
};

const getTypeColor = (type: string) => {
    switch (type) {
        case 'requisition':
            return 'text-blue-600 dark:text-blue-400';
        case 'purchase_order':
            return 'text-green-600 dark:text-green-400';
        case 'delivery':
            return 'text-purple-600 dark:text-purple-400';
        case 'inventory':
            return 'text-orange-600 dark:text-orange-400';
        case 'return':
            return 'text-red-600 dark:text-red-400';
        case 'user':
            return 'text-cyan-600 dark:text-cyan-400';
        case 'service':
            return 'text-indigo-600 dark:text-indigo-400';
        case 'system':
            return 'text-gray-600 dark:text-gray-400';
        default:
            return 'text-gray-600 dark:text-gray-400';
    }
};

const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
};

export default function Notifications() {
    const [notifications, setNotifications] = useState(notificationsData);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const filteredNotifications = notifications.filter(notification =>
        filter === 'all' || !notification.isRead
    );

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleNotificationClick = (notification: any) => {
        // Mark as read
        setNotifications(prev =>
            prev.map(n =>
                n.id === notification.id ? { ...n, isRead: true } : n
            )
        );

        // Redirect to the appropriate page
        if (notification.redirectTo) {
            router.visit(notification.redirectTo);
        }
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, isRead: true }))
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            System alerts and activity updates
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Mark All as Read
                        </button>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {notifications.length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Notifications</div>
                    </div>
                    <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {unreadCount}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Unread</div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-1">
                    <div className="flex border-b border-sidebar-border">
                        <button
                            onClick={() => setFilter('all')}
                            className={`flex-1 px-4 py-2 text-sm font-medium text-center transition-colors ${
                                filter === 'all'
                                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            All Notifications
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`flex-1 px-4 py-2 text-sm font-medium text-center transition-colors ${
                                filter === 'unread'
                                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            Unread ({unreadCount})
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border bg-white dark:bg-sidebar">
                    <div className="h-full overflow-y-auto">
                        {filteredNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-4">
                                <div className="text-gray-400 dark:text-gray-600 mb-4">
                                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No notifications found
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                    {filter === 'unread'
                                        ? 'You have no unread notifications'
                                        : 'All notifications are cleared'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-sidebar-border">
                                {filteredNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 transition-colors cursor-pointer ${
                                            !notification.isRead
                                                ? 'bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20'
                                                : 'hover:bg-gray-50 dark:hover:bg-sidebar-accent'
                                        }`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`flex-shrink-0 p-2 rounded-lg ${getTypeColor(notification.type)} bg-white dark:bg-sidebar border border-sidebar-border`}>
                                                {NotificationIcons[notification.type as keyof typeof NotificationIcons]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                                            {notification.title}
                                                        </h4>
                                                        {!notification.isRead && (
                                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                        {formatTime(notification.timestamp)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                                        {notification.referenceId}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        {!notification.isRead && (
                                                            <span className="text-xs text-blue-600 dark:text-blue-400">
                                                                Click to view
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            → {notification.redirectTo.replace('/', '')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
