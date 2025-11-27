import AppLayout from '@/layouts/app-layout';
import { roles } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

interface PermissionEditProps {
    auth: any;
    permissionId: number;
}

const breadcrumbs = (permissionId: number): BreadcrumbItem[] => [
    {
        title: 'Roles & Permissions',
        href: roles().url,
    },
    {
        title: `Edit Permission #${permissionId}`,
        href: `/roles-permissions/permission/${permissionId}/edit`,
    },
];

export default function PermissionEdit({ auth, permissionId }: PermissionEditProps) {
    const [formData, setFormData] = useState({
        NAME: '',
        DESCRIPTION: '',
        CATEGORY: 'user',
        IS_ACTIVE: true
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load permission data on component mount
    useEffect(() => {
        loadPermissionData();
    }, [permissionId]);

    const loadPermissionData = () => {
        setIsLoading(true);

        try {
            // Mock data - in real app, fetch from API
            const mockPermissions = [
                {
                    ID: 1,
                    NAME: 'user_create',
                    DESCRIPTION: 'Create new users in the system',
                    CATEGORY: 'user',
                    IS_ACTIVE: true,
                    ROLE_COUNT: 2,
                    CREATED_AT: new Date().toISOString()
                },
                {
                    ID: 2,
                    NAME: 'user_edit',
                    DESCRIPTION: 'Edit existing user information',
                    CATEGORY: 'user',
                    IS_ACTIVE: true,
                    ROLE_COUNT: 2,
                    CREATED_AT: new Date().toISOString()
                },
                {
                    ID: 3,
                    NAME: 'user_delete',
                    DESCRIPTION: 'Remove users from the system',
                    CATEGORY: 'user',
                    IS_ACTIVE: true,
                    ROLE_COUNT: 1,
                    CREATED_AT: new Date().toISOString()
                },
                {
                    ID: 4,
                    NAME: 'data_view',
                    DESCRIPTION: 'View all system data',
                    CATEGORY: 'data',
                    IS_ACTIVE: true,
                    ROLE_COUNT: 4,
                    CREATED_AT: new Date().toISOString()
                }
            ];

            const permission = mockPermissions.find(p => p.ID === permissionId);

            if (!permission) {
                console.error(`Permission #${permissionId} not found`);
                alert('Permission not found!');
                router.visit(roles().url);
                return;
            }

            setFormData({
                NAME: permission.NAME || '',
                DESCRIPTION: permission.DESCRIPTION || '',
                CATEGORY: permission.CATEGORY || 'user',
                IS_ACTIVE: permission.IS_ACTIVE || true
            });
        } catch (error) {
            console.error('Error loading permission data:', error);
            alert('Error loading permission data!');
            router.visit(roles().url);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare updated permission data
        const updatedPermissionData = {
            ...formData,
            UPDATED_AT: new Date().toISOString()
        };

        console.log('Updated Permission Data:', updatedPermissionData);

        // In real application, you would send PATCH request to backend
        alert('Permission updated successfully!');

        // Redirect back to roles & permissions
        router.visit(roles().url);
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDelete = () => {
        console.log('Deleting permission:', permissionId);

        // In real application, you would send DELETE request to backend
        alert('Permission deleted successfully!');
        setShowDeleteConfirm(false);

        // Redirect back to roles & permissions
        router.visit(roles().url);
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.visit(roles().url);
        }
    };

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs(permissionId)}>
                <Head title="Edit Permission" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Edit Permission</h1>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading permission data...</p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs(permissionId)}>
                <Head title="Edit Permission" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Edit Permission</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Editing Permission #{permissionId}
                            </p>
                        </div>
                        <Link
                            href={roles().url}
                            className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                        >
                            Return to Roles & Permissions
                        </Link>
                    </div>

                    {/* Form Container */}
                    <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-white dark:bg-sidebar">
                        <div className="h-full overflow-y-auto">
                            <div className="min-h-full flex items-start justify-center p-6">
                                <div className="w-full max-w-2xl bg-white dark:bg-background rounded-xl border border-sidebar-border/70 shadow-lg">
                                    {/* Header Section */}
                                    <div className="border-b border-sidebar-border/70 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            Edit Permission #{permissionId}
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Update the permission details below
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="p-6">
                                        <div className="space-y-6">
                                            {/* Basic Information */}
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    Permission Information
                                                </h3>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Permission Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.NAME}
                                                        onChange={(e) => handleInputChange('NAME', e.target.value)}
                                                        className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                        placeholder="Enter permission name"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Description *
                                                    </label>
                                                    <textarea
                                                        required
                                                        value={formData.DESCRIPTION}
                                                        onChange={(e) => handleInputChange('DESCRIPTION', e.target.value)}
                                                        rows={3}
                                                        className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                        placeholder="Describe the permission..."
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Category *
                                                    </label>
                                                    <select
                                                        required
                                                        value={formData.CATEGORY}
                                                        onChange={(e) => handleInputChange('CATEGORY', e.target.value)}
                                                        className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                    >
                                                        <option value="user">User Permissions</option>
                                                        <option value="data">Data Permissions</option>
                                                        <option value="system">System Permissions</option>
                                                    </select>
                                                </div>

                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="is_active"
                                                        checked={formData.IS_ACTIVE}
                                                        onChange={(e) => handleInputChange('IS_ACTIVE', e.target.checked)}
                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                    />
                                                    <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                        Active Permission
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="sticky bottom-0 bg-white dark:bg-background pt-6 pb-2 border-t border-sidebar-border/70 -mx-6 px-6 mt-8">
                                            <div className="flex justify-between items-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowDeleteConfirm(true)}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete Permission
                                                </button>
                                                <div className="flex gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={handleCancel}
                                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                                    >
                                                        Save Changes
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-sidebar rounded-xl max-w-md w-full border border-sidebar-border">
                        <div className="p-6 border-b border-sidebar-border">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Delete Permission
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Are you sure you want to delete "{formData.NAME}"? This action cannot be undone.
                            </p>
                        </div>
                        <div className="p-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                            >
                                Delete Permission
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
