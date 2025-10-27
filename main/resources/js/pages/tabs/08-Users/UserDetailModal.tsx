// components/UserDetailModal.tsx
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Shield, Edit, User, Calendar, Mail } from 'lucide-react';

interface UserDetailModalProps {
    user: any;
    isOpen: boolean;
    onClose: () => void;
    onStatusUpdate: (id: number, status: 'active' | 'inactive') => void;
}

export default function UserDetailModal({
                                            user,
                                            isOpen,
                                            onClose,
                                            onStatusUpdate,
                                        }: UserDetailModalProps) {
    const [showStatusConfirm, setShowStatusConfirm] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<'active' | 'inactive' | null>(null);

    const handleEdit = () => {
        router.get(`/users/${user.id}/edit`);
        onClose();
    };

    const handleStatusChange = (newStatus: 'active' | 'inactive') => {
        setPendingStatus(newStatus);
        setShowStatusConfirm(true);
    };

    const confirmStatusChange = () => {
        if (pendingStatus) {
            onStatusUpdate(user.id, pendingStatus);
            setShowStatusConfirm(false);
            setPendingStatus(null);
            onClose();
        }
    };

    const cancelStatusChange = () => {
        setShowStatusConfirm(false);
        setPendingStatus(null);
    };

    const getStatusColor = (status: string) => {
        return status === 'active'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'Admin':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
            case 'Manager':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
            case 'Staff':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-sidebar rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-sidebar-border">
                    {/* Header */}
                    <div className="p-6 border-b border-sidebar-border bg-white dark:bg-sidebar">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                User Details
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6 bg-white dark:bg-sidebar">
                        {/* User Profile */}
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                {user.fullname.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {user.fullname}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">@{user.username}</p>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Role
                                    </label>
                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                                        <Shield className="w-4 h-4" />
                                        {user.role}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {user.role_description}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Status
                                    </label>
                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(user.status)}`}>
                                        <User className="w-4 h-4" />
                                        {user.status === 'active' ? 'Active' : 'Inactive'}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Created
                                    </label>
                                    <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        {formatDate(user.created_at)}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Last Updated
                                    </label>
                                    <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        {formatDate(user.updated_at)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer with Actions */}
                    <div className="p-6 border-t border-sidebar-border bg-gray-50 dark:bg-sidebar-accent">
                        <div className="flex justify-between items-center">
                            <div className="flex gap-3">
                                <button
                                    onClick={handleEdit}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit User
                                </button>
                            </div>
                            <div className="flex gap-3">
                                {user.status === 'active' ? (
                                    <button
                                        onClick={() => handleStatusChange('inactive')}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                                    >
                                        Deactivate User
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleStatusChange('active')}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                                    >
                                        Activate User
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Change Confirmation Modal */}
            {showStatusConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-sidebar rounded-xl max-w-md w-full border border-sidebar-border">
                        <div className="p-6 border-b border-sidebar-border">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Confirm Status Change
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Are you sure you want to {pendingStatus === 'active' ? 'activate' : 'deactivate'} this user?
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Note: {pendingStatus === 'active'
                                ? 'activating the user will allow them to log in to the system.'
                                : 'deactivating the account will mark it as inactive and it cannot be logged into unless activated again.'
                            }
                            </p>
                        </div>
                        <div className="p-6 flex justify-end gap-3">
                            <button
                                onClick={cancelStatusChange}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmStatusChange}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
                                    pendingStatus === 'active'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
