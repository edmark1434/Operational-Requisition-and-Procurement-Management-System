import AppLayout from '@/layouts/app-layout';
import { roles } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

// Import your permissions data

interface RoleEditProps {
    auth: any;
    roleId: number;
    role: any;
    permissions: any[];
}

const breadcrumbs = (roleId: number): BreadcrumbItem[] => [
    {
        title: 'Roles & Permissions',
        href: roles().url,
    },
    {
        title: `Edit Role #${roleId}`,
        href: `/roles/${roleId}/edit`,
    },
];

export default function RoleEdit({ auth, roleId, role,permissions }: RoleEditProps) {
    const [formData, setFormData] = useState({
        NAME: role.NAME || null,
        DESCRIPTION: role.DESCRIPTION || null,
        IS_ACTIVE: role.IS_ACTIVE || null
    });
    const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set(role.PERMISSIONS));
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [permissionCategories, setPermissionCategories] = useState<{[key: string]: any[]}>({});
    // Group permissions by category
    useEffect(() => {
        const grouped = permissions.reduce((acc, permission) => {
            const category = permission.CATEGORY;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(permission);
            return acc;
        }, {} as {[key: string]: any[]});

        setPermissionCategories(grouped);
    }, []);

    // Load role data on component mount
    useEffect(() => {
        if (formData.NAME) {
            setIsLoading(false);
        }
    }, [formData.NAME]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare updated role data
        const updatedRoleData = {
            ...formData,
            PERMISSIONS: Array.from(selectedPermissions),
        };
        // Redirect back to roles & permissions 
        
        router.put(`/roles/${roleId}/update`, updatedRoleData, {
            onError: () => {
                alert('Error in updating the forms');
            }
        })    

    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePermissionToggle = (permissionId: string) => {
        setSelectedPermissions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(permissionId)) {
                newSet.delete(permissionId);
            } else {
                newSet.add(permissionId);
            }
            return newSet;
        });
    };

    const handleSelectAllInCategory = (category: string) => {
        const categoryPermissions = permissionCategories[category] || [];
        const allSelected = categoryPermissions.every(perm =>
            selectedPermissions.has(perm.PERMISSION_ID)
        );

        setSelectedPermissions(prev => {
            const newSet = new Set(prev);
            categoryPermissions.forEach(perm => {
                if (allSelected) {
                    newSet.delete(perm.PERMISSION_ID);
                } else {
                    newSet.add(perm.PERMISSION_ID);
                }
            });
            return newSet;
        });
    };

    const handleSelectAll = () => {
        const allPermissionIds = permissions.map(perm => perm.PERMISSION_ID);
        const allSelected = allPermissionIds.every(id => selectedPermissions.has(id));

        setSelectedPermissions(allSelected ? new Set() : new Set(allPermissionIds));
    };

    const handleDelete = () => {
        try {
            router.delete(`/roles/${roleId}/delete`);
        } catch (err) {
            console.log(err);
        }  
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.visit(roles().url);
        }
    };

    const isCategoryAllSelected = (category: string) => {
        const categoryPermissions = permissionCategories[category] || [];
        return categoryPermissions.length > 0 && categoryPermissions.every(perm =>
            selectedPermissions.has(perm.PERMISSION_ID)
        );
    };

    const isCategorySomeSelected = (category: string) => {
        const categoryPermissions = permissionCategories[category] || [];
        return categoryPermissions.some(perm =>
            selectedPermissions.has(perm.PERMISSION_ID)
        ) && !isCategoryAllSelected(category);
    };

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs(roleId)}>
                <Head title="Edit Role" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Edit Role</h1>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading role data...</p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs(roleId)}>
                <Head title="Edit Role" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Edit Role</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Editing Role #{roleId} - {formData.NAME}
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
                                <div className="w-full max-w-4xl bg-white dark:bg-background rounded-xl border border-sidebar-border/70 shadow-lg">
                                    {/* Header Section */}
                                    <div className="border-b border-sidebar-border/70 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            Edit Role #{roleId}
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Update the role details and permissions below
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="p-6">
                                        <div className="space-y-8">
                                            {/* Basic Information */}
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-3">
                                                    Role Information
                                                </h3>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Role Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.NAME}
                                                        onChange={(e) => handleInputChange('NAME', e.target.value)}
                                                        className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                        placeholder="Enter role name"
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
                                                        placeholder="Describe the role..."
                                                    />
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
                                                        Active Role
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Permissions Section */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-3">
                                                        Role Permissions
                                                    </h3>
                                                    <button
                                                        type="button"
                                                        onClick={handleSelectAll}
                                                        className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                                                    >
                                                        {selectedPermissions.size === permissions.length ? 'Deselect All' : 'Select All'}
                                                    </button>
                                                </div>

                                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                    Selected {selectedPermissions.size} of {permissions.length} permissions
                                                </div>

                                                <div className="space-y-6">
                                                    {Object.entries(permissionCategories).map(([category, categoryPermissions]) => (
                                                        <div key={category} className="border border-sidebar-border/70 rounded-lg overflow-hidden">
                                                            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-sidebar-border/70">
                                                                <div className="flex items-center justify-between">
                                                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                                                        {category}
                                                                    </h4>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleSelectAllInCategory(category)}
                                                                        className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                                                    >
                                                                        {isCategoryAllSelected(category) ? 'Deselect All' : 'Select All'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {categoryPermissions.map((permission) => (
                                                                    <div key={permission.PERMISSION_ID} className="flex items-start space-x-3">
                                                                        <input
                                                                            type="checkbox"
                                                                            id={`perm-${permission.PERMISSION_ID}`}
                                                                            checked={selectedPermissions.has(permission.PERMISSION_ID)}
                                                                            onChange={() => handlePermissionToggle(permission.PERMISSION_ID)}
                                                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mt-1"
                                                                        />
                                                                        <label
                                                                            htmlFor={`perm-${permission.PERMISSION_ID}`}
                                                                            className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                                                                        >
                                                                            <div className="font-medium">{permission.NAME}</div>
                                                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                                {permission.DESCRIPTION}
                                                                            </div>
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
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
                                                    Delete Role
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
                                                        Save Changes ({selectedPermissions.size} permissions)
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
                                Delete Role
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
                                Delete Role
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
