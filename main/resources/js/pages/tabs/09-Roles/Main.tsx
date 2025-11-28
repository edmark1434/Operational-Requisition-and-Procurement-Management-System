import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// Import components
import RolesPermissionsStats from './components/RolesPermissionsStats';
import RolesList from './components/RolesList';
import PermissionsList from './components/PermissionsList';
import RoleDetailModal from './components/RoleDetailModal';

// Import datasets
import rolesData from '@/pages/datasets/role';
import rolePermissionsData from '@/pages/datasets/role_permission';
import permissionsData from '@/pages/datasets/permissions';

// Import utilities
import { useRolesPermissionsFilters } from './utils/hooks/useRolesPermissionsFilters';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles & Permissions',
        href: '/roles-permissions',
    },
];

interface Role {
    RO_ID: number;
    NAME: string;
    DESCRIPTION: string;
    IS_ACTIVE: boolean;
    permissions: string[];
    permissionCount: number;
}

interface Permission {
    PERMISSION_ID: string;
    NAME: string;
    DESCRIPTION: string;
    CATEGORY: string;
}

export default function RolesAndPermissions() {
    const [rolesSearchTerm, setRolesSearchTerm] = useState('');
    const [permissionsSearchTerm, setPermissionsSearchTerm] = useState('');
    const [roleStatusFilter, setRoleStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [permissionCategoryFilter, setPermissionCategoryFilter] = useState<'all' | string>('all');
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);

    // Load data from datasets
    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        // Transform permissions data
        const transformedPermissions: Permission[] = permissionsData.map(perm => ({
            PERMISSION_ID: perm.PERMISSION_ID,
            NAME: perm.NAME,
            DESCRIPTION: perm.DESCRIPTION,
            CATEGORY: perm.CATEGORY
        }));

        // Transform roles data with their permissions
        const transformedRoles: Role[] = rolesData.map(role => {
            const rolePerms = rolePermissionsData
                .filter(rp => rp.ROLE_ID === role.RO_ID)
                .map(rp => {
                    const perm = permissionsData.find(p => p.PERMISSION_ID === rp.PERM_ID);
                    return perm ? perm.NAME : '';
                })
                .filter(name => name !== '');

            return {
                RO_ID: role.RO_ID,
                NAME: role.NAME,
                DESCRIPTION: role.DESCRIPTION,
                IS_ACTIVE: true, // All roles are active by default
                permissions: rolePerms,
                permissionCount: rolePerms.length
            };
        });

        setPermissions(transformedPermissions);
        setRoles(transformedRoles);
    };

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

    const categories = useMemo(() => {
        const uniqueCategories = [...new Set(permissions.map(p => p.CATEGORY))];
        return ['All', ...uniqueCategories];
    }, [permissions]);

    const handleDeleteRole = (id: number) => {
        if (id === 8001) {
            alert('Cannot delete the Admin role!');
            return;
        }

        if (window.confirm('Are you sure you want to delete this role?')) {
            setRoles(prev => prev.filter(role => role.RO_ID !== id));
            setIsRoleModalOpen(false);
        }
    };

    const openRoleModal = (role: Role) => {
        setSelectedRole(role);
        setIsRoleModalOpen(true);
    };

    const closeAllModals = () => {
        setIsRoleModalOpen(false);
        setSelectedRole(null);
    };

    const clearRolesFilters = () => {
        setRolesSearchTerm('');
        setRoleStatusFilter('all');
    };

    const clearPermissionsFilters = () => {
        setPermissionsSearchTerm('');
        setPermissionCategoryFilter('all');
    };

    const getPermissionsByCategory = useMemo(() => {
        const categories: { [key: string]: Permission[] } = {};
        permissions.forEach(permission => {
            if (!categories[permission.CATEGORY]) {
                categories[permission.CATEGORY] = [];
            }
            categories[permission.CATEGORY].push(permission);
        });
        return categories;
    }, [permissions]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles & Permissions" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Roles & Permissions</h1>
                    <div className="flex gap-3">
                        <Link
                            href="/roles/add"
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
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">System Roles</h2>
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
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
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

                                {/*/!* Status Filter *!/*/}
                                {/*<div>*/}
                                {/*    <select*/}
                                {/*        value={roleStatusFilter}*/}
                                {/*        onChange={(e) => setRoleStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}*/}
                                {/*        className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"*/}
                                {/*    >*/}
                                {/*        <option value="all">All Status</option>*/}
                                {/*        <option value="active">Active Only</option>*/}
                                {/*        <option value="inactive">Inactive Only</option>*/}
                                {/*    </select>*/}
                                {/*</div>*/}
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
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">System Permissions</h2>
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
                                        onChange={(e) => setPermissionCategoryFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                    >
                                        {categories.map(category => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <PermissionsList
                                permissions={filteredPermissions}
                                getPermissionsByCategory={getPermissionsByCategory}
                            />
                        </div>
                    </div>
                </div>

                {/* Role Modal */}
                {isRoleModalOpen && (
                    <RoleDetailModal
                        role={selectedRole}
                        isOpen={isRoleModalOpen}
                        onClose={closeAllModals}
                        onEdit={() => {
                            window.location.href = `/roles-permissions/role/${selectedRole?.RO_ID}/edit`;
                        }}
                        onDelete={handleDeleteRole}
                        permissions={permissions}
                    />
                )}
            </div>
        </AppLayout>
    );
}
