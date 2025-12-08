import AppLayout from '@/layouts/app-layout';
import { notifications, notificationsIsRead, notificationsMarkAsAllRead } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notifications',
        href: notifications().url,
    },
];

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

interface Prop {
    notificationsList: any[];
}

export default function Notifications({ notificationsList }: Prop) {
    // Sort notifications by date (newest first)
    const [notifications, setNotifications] = useState(() =>
        [...notificationsList].sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
    );
    const [filter, setFilter] = useState<'unread' | 'read' | 'all'>('unread');

    // Update notifications when props change
    useEffect(() => {
        const sorted = [...notificationsList].sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setNotifications(sorted);
    }, [notificationsList]);

    // Filter notifications based on selected tab
    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !notification.isRead;
        if (filter === 'read') return notification.isRead;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const readCount = notifications.filter(n => n.isRead).length;

    const handleNotificationClick = (notification: any) => {
        // Only mark as read if it's currently unread
        if (!notification.isRead) {
            router.put(`/notifications/${notification.id}/read`, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    // Update local state
                    setNotifications(prev =>
                        prev.map(n =>
                            n.id === notification.id
                                ? { ...n, isRead: true }
                                : n
                        ).sort((a, b) =>
                            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                        )
                    );
                }
            });
        }
    };

    const markAllAsRead = () => {
        router.put('/notifications/mark-all-read', {}, {
            preserveScroll: true,
            onSuccess: () => {
                // Update all in local state
                setNotifications(prev =>
                    prev.map(notification => ({ ...notification, isRead: true }))
                        .sort((a, b) =>
                            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                        )
                );
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
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

                {/* Stats Cards - DISPLAY ONLY (not clickable) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {notifications.length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Notifications</div>
                    </div>
                    <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                        <div className={`text-2xl font-bold ${
                            filter === 'unread'
                                ? 'text-orange-600 dark:text-orange-400'
                                : 'text-orange-600 dark:text-orange-400'
                        }`}>
                            {unreadCount}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Unread</div>
                    </div>
                    <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                        <div className={`text-2xl font-bold ${
                            filter === 'read'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-green-600 dark:text-green-400'
                        }`}>
                            {readCount}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Read</div>
                    </div>
                </div>

                {/* Filter Tabs - THESE ARE CLICKABLE */}
                <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-1">
                    <div className="flex">
                        <button
                            onClick={() => setFilter('unread')}
                            className={`flex-1 px-4 py-2 text-sm font-medium text-center transition-colors ${
                                filter === 'unread'
                                    ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-500'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            Unread ({unreadCount})
                        </button>
                        <button
                            onClick={() => setFilter('read')}
                            className={`flex-1 px-4 py-2 text-sm font-medium text-center transition-colors ${
                                filter === 'read'
                                    ? 'text-green-600 dark:text-green-400 border-b-2 border-green-500'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            Read ({readCount})
                        </button>
                        <button
                            onClick={() => setFilter('all')}
                            className={`flex-1 px-4 py-2 text-sm font-medium text-center transition-colors ${
                                filter === 'all'
                                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            All
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
                                        : filter === 'read'
                                            ? 'You have no read notifications'
                                            : 'No notifications available'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-sidebar-border">
                                {filteredNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-sidebar-accent ${
                                            !notification.isRead
                                                ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500'
                                                : ''
                                        }`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-1">
                                                    <p className={`text-sm font-medium ${
                                                        !notification.isRead
                                                            ? 'text-gray-900 dark:text-white'
                                                            : 'text-gray-600 dark:text-gray-400'
                                                    }`}>
                                                        {notification.message}
                                                    </p>
                                                    {!notification.isRead && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                                            New
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatTime(notification.timestamp)}
                                                    </span>
                                                    {!notification.isRead && (
                                                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                                            Click to mark as read
                                                        </span>
                                                    )}
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
