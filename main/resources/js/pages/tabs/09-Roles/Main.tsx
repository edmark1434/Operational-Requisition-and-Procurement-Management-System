import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// Import components
import RolesPermissionsStats from './components/RolesPermissionsStats';
import RolesList from './components/RolesList';
import PermissionsList from './components/PermissionsList';
import RoleDetailModal from './components/RoleDetailModal';
import PermissionDetailModal from './components/PermissionDetailModal';

// Import utilities
import { transformRolesData, transformPermissionsData } from './utils';
import { useRolesPermissionsFilters } from './utils/hooks/useRolesPermissionsFilters';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles & Permissions',
        href: '/roles-permissions',
    },
];

export default function RolesAndPermissions() {
    const [rolesSearchTerm, setRolesSearchTerm] = useState('');
    const [permissionsSearchTerm, setPermissionsSearchTerm] = useState('');
    const [roleStatusFilter, setRoleStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [permissionCategoryFilter, setPermissionCategoryFilter] = useState<'all' | 'user' | 'data' | 'system'>('all');
    const [selectedRole, setSelectedRole] = useState<any>(null);
    const [selectedPermission, setSelectedPermission] = useState<any>(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

    const [roles, setRoles] = useState<any[]>([]);
    const [permissions, setPermissions] = useState<any[]>([]);

    const {
        filteredRoles,
        filteredPermissions
    } = useRolesPermissionsFilters(
        roles,
        permissions,
        rolesSearchTerm,
        permissionsSearchTerm,
        roleStatusFilter,
        permissionCategoryFilter
    );

    // Load initial data
    useEffect(() => {
        const initialRoles = [
            {
                ID: 1,
                NAME: 'Administrator',
                DESCRIPTION: 'Full system access with all permissions',
                IS_ACTIVE: true,
                PERMISSION_COUNT: 12,
                CREATED_AT: new Date().toISOString()
            },
            {
                ID: 2,
                NAME: 'Manager',
                DESCRIPTION: 'Management level access with limited administrative functions',
                IS_ACTIVE: true,
                PERMISSION_COUNT: 8,
                CREATED_AT: new Date().toISOString()
            },
            {
                ID: 3,
                NAME: 'User',
                DESCRIPTION: 'Standard user with basic access rights',
                IS_ACTIVE: true,
                PERMISSION_COUNT: 4,
                CREATED_AT: new Date().toISOString()
            },
            {
                ID: 4,
                NAME: 'Viewer',
                DESCRIPTION: 'Read-only access to view data',
                IS_ACTIVE: false,
                PERMISSION_COUNT: 2,
                CREATED_AT: new Date().toISOString()
            }
        ];

        const initialPermissions = [
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
            },
            {
                ID: 5,
                NAME: 'data_edit',
                DESCRIPTION: 'Modify system data',
                CATEGORY: 'data',
                IS_ACTIVE: true,
                ROLE_COUNT: 2,
                CREATED_AT: new Date().toISOString()
            },
            {
                ID: 6,
                NAME: 'system_settings',
                DESCRIPTION: 'Access and modify system settings',
                CATEGORY: 'system',
                IS_ACTIVE: true,
                ROLE_COUNT: 1,
                CREATED_AT: new Date().toISOString()
            }
        ];

        setRoles(initialRoles);
        setPermissions(initialPermissions);
    }, []);

    const handleDeleteRole = (id: number) => {
        setRoles(prev => prev.filter(role => role.ID !== id));
        setIsRoleModalOpen(false);
    };

    const handleDeletePermission = (id: number) => {
        setPermissions(prev => prev.filter(permission => permission.ID !== id));
        setIsPermissionModalOpen(false);
    };

    const openRoleModal = (role: any) => {
        setSelectedRole(role);
        setIsRoleModalOpen(true);
    };

    const openPermissionModal = (permission: any) => {
        setSelectedPermission(permission);
        setIsPermissionModalOpen(true);
    };

    const closeAllModals = () => {
        setIsRoleModalOpen(false);
        setIsPermissionModalOpen(false);
        setSelectedRole(null);
        setSelectedPermission(null);
    };

    const clearRolesFilters = () => {
        setRolesSearchTerm('');
        setRoleStatusFilter('all');
    };

    const clearPermissionsFilters = () => {
        setPermissionsSearchTerm('');
        setPermissionCategoryFilter('all');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles & Permissions" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Roles & Permissions</h1>
                    <div className="flex gap-3">
                        <Link
                            href="/roles-permissions/permission/add"
                            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Permission
                        </Link>
                        <Link
                            href="/roles-permissions/role/add"
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Role
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <RolesPermissionsStats roles={roles} permissions={permissions} />

                {/* Split Layout - Roles on Left, Permissions on Right */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1">
                    {/* Roles Section - Left Side */}
                    <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border overflow-hidden flex flex-col">
                        <div className="border-b border-sidebar-border p-6 flex-shrink-0">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Roles</h2>
                                <div className="flex items-center gap-2">
                                    {(rolesSearchTerm || roleStatusFilter !== 'all') && (
                                        <button
                                            onClick={clearRolesFilters}
                                            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {filteredRoles.length} {filteredRoles.length === 1 ? 'role' : 'roles'}
                                    </span>
                                </div>
                            </div>

                            {/* Roles Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Search */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search roles..."
                                        value={rolesSearchTerm}
                                        onChange={(e) => setRolesSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* Status Filter */}
                                <div>
                                    <select
                                        value={roleStatusFilter}
                                        onChange={(e) => setRoleStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                                        className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active Only</option>
                                        <option value="inactive">Inactive Only</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <RolesList
                                roles={filteredRoles}
                                onRoleClick={openRoleModal}
                            />
                        </div>
                    </div>

                    {/* Permissions Section - Right Side */}
                    <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border overflow-hidden flex flex-col">
                        <div className="border-b border-sidebar-border p-6 flex-shrink-0">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Permissions</h2>
                                <div className="flex items-center gap-2">
                                    {(permissionsSearchTerm || permissionCategoryFilter !== 'all') && (
                                        <button
                                            onClick={clearPermissionsFilters}
                                            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {filteredPermissions.length} {filteredPermissions.length === 1 ? 'permission' : 'permissions'}
                                    </span>
                                </div>
                            </div>

                            {/* Permissions Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Search */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search permissions..."
                                        value={permissionsSearchTerm}
                                        onChange={(e) => setPermissionsSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* Category Filter */}
                                <div>
                                    <select
                                        value={permissionCategoryFilter}
                                        onChange={(e) => setPermissionCategoryFilter(e.target.value as 'all' | 'user' | 'data' | 'system')}
                                        className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                    >
                                        <option value="all">All Categories</option>
                                        <option value="user">User Permissions</option>
                                        <option value="data">Data Permissions</option>
                                        <option value="system">System Permissions</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <PermissionsList
                                permissions={filteredPermissions}
                                onPermissionClick={openPermissionModal}
                            />
                        </div>
                    </div>
                </div>

                {/* Modals */}
                {isRoleModalOpen && (
                    <RoleDetailModal
                        role={selectedRole}
                        isOpen={isRoleModalOpen}
                        onClose={closeAllModals}
                        onEdit={() => {
                            window.location.href = `/roles-permissions/role/${selectedRole.ID}/edit`;
                        }}
                        onDelete={handleDeleteRole}
                    />
                )}

                {isPermissionModalOpen && (
                    <PermissionDetailModal
                        permission={selectedPermission}
                        isOpen={isPermissionModalOpen}
                        onClose={closeAllModals}
                        onEdit={() => {
                            window.location.href = `/roles-permissions/permission/${selectedPermission.ID}/edit`;
                        }}
                        onDelete={handleDeletePermission}
                    />
                )}
            </div>
        </AppLayout>
    );
}
