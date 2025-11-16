import { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { roles } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Plus, Shield, Key, Users, Trash2, Search, ChevronDown, ChevronUp } from 'lucide-react';

// Import datasets
import rolesData from '@/pages/datasets/role';
import rolePermissionsData from '@/pages/datasets/role_permission';
import permissionsData from '@/pages/datasets/permissions';

interface Role {
    RO_ID: number;
    NAME: string;
    DESCRIPTION: string;
    permissions: string[];
}

interface Permission {
    PERMISSION_ID: string;
    NAME: string;
    DESCRIPTION: string;
    CATEGORY: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles & Permissions',
        href: roles().url,
    },
];

// Define your platform categories based on your system
const PLATFORM_CATEGORIES = [
    'Dashboard',
    'Requisitions',
    'Inventory',
    'Purchases',
    'Suppliers',
    'Deliveries',
    'Returns',
    'Audit Logs',
    'Users Management',
    'Roles & Permissions'
];

export default function RolePerm() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [showAddRole, setShowAddRole] = useState(false);
    const [showAddPermission, setShowAddPermission] = useState(false);
    const [newRole, setNewRole] = useState({ NAME: '', DESCRIPTION: '', permissions: [] as string[] });
    const [newPermission, setNewPermission] = useState({ NAME: '', DESCRIPTION: '', CATEGORY: '' });

    // Search and filter states
    const [roleSearch, setRoleSearch] = useState('');
    const [permissionSearch, setPermissionSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [expandedRoles, setExpandedRoles] = useState<number[]>([]);
    const [activeMatrixTab, setActiveMatrixTab] = useState('All');

    // Load data from datasets
    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        // Transform permissions data - handle missing CATEGORY field
        const transformedPermissions: Permission[] = permissionsData.map(perm => {
            // Handle different possible permission data structures
            const permissionWithCategory = perm as any;
            return {
                PERMISSION_ID: permissionWithCategory.PERMISSION_ID || permissionWithCategory.PERM_ID || `perm_${Date.now()}`,
                NAME: permissionWithCategory.NAME,
                DESCRIPTION: permissionWithCategory.DESCRIPTION,
                CATEGORY: permissionWithCategory.CATEGORY || 'General'
            };
        });

        // Transform roles data with their permissions
        const transformedRoles: Role[] = rolesData.map(role => {
            const rolePerms = rolePermissionsData
                .filter(rp => rp.ROLE_ID === role.RO_ID)
                .map(rp => {
                    const perm = permissionsData.find(p =>
                        (p as any).PERMISSION_ID === rp.PERM_ID || (p as any).PERM_ID === rp.PERM_ID
                    );
                    return perm ? perm.NAME : '';
                })
                .filter(name => name !== '');

            return {
                RO_ID: role.RO_ID,
                NAME: role.NAME,
                DESCRIPTION: role.DESCRIPTION,
                permissions: rolePerms
            };
        });

        setPermissions(transformedPermissions);
        setRoles(transformedRoles);
    };

    // Filtered data using useMemo for performance
    const filteredRoles = useMemo(() => {
        return roles.filter(role =>
            role.NAME.toLowerCase().includes(roleSearch.toLowerCase()) ||
            role.DESCRIPTION.toLowerCase().includes(roleSearch.toLowerCase())
        );
    }, [roles, roleSearch]);

    const filteredPermissions = useMemo(() => {
        return permissions.filter(permission =>
            permission.NAME.toLowerCase().includes(permissionSearch.toLowerCase()) &&
            (selectedCategory === 'All' || permission.CATEGORY === selectedCategory)
        );
    }, [permissions, permissionSearch, selectedCategory]);

    const categories = useMemo(() => {
        const uniqueCategories = [...new Set(permissions.map(p => p.CATEGORY))];
        return ['All', ...uniqueCategories];
    }, [permissions]);

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

    const getFilteredPermissionsForMatrix = useMemo(() => {
        if (activeMatrixTab === 'All') {
            return permissions;
        }
        return permissions.filter(permission => permission.CATEGORY === activeMatrixTab);
    }, [permissions, activeMatrixTab]);

    // Role operations
    const handleAddRole = () => {
        if (newRole.NAME.trim()) {
            const role: Role = {
                RO_ID: Math.max(...roles.map(r => r.RO_ID), 0) + 1,
                NAME: newRole.NAME,
                DESCRIPTION: newRole.DESCRIPTION,
                permissions: newRole.permissions
            };
            setRoles([...roles, role]);
            setNewRole({ NAME: '', DESCRIPTION: '', permissions: [] });
            setShowAddRole(false);
        }
    };

    const handleAddPermission = () => {
        if (newPermission.NAME.trim() && newPermission.CATEGORY.trim()) {
            const permission: Permission = {
                PERMISSION_ID: `perm_${Date.now()}`,
                NAME: newPermission.NAME,
                DESCRIPTION: newPermission.DESCRIPTION,
                CATEGORY: newPermission.CATEGORY
            };
            setPermissions([...permissions, permission]);
            setNewPermission({ NAME: '', DESCRIPTION: '', CATEGORY: '' });
            setShowAddPermission(false);
        }
    };

    const handleDeleteRole = (RO_ID: number) => {
        if (RO_ID === 8001) {
            alert('Cannot delete the Admin role!');
            return;
        }
        if (window.confirm('Are you sure you want to delete this role?')) {
            setRoles(roles.filter(role => role.RO_ID !== RO_ID));
        }
    };

    const handleDeletePermission = (PERMISSION_ID: string) => {
        if (window.confirm('Are you sure you want to delete this permission?')) {
            setPermissions(permissions.filter(permission => permission.PERMISSION_ID !== PERMISSION_ID));
            setRoles(roles.map(role => ({
                ...role,
                permissions: role.permissions.filter(perm => {
                    const permission = permissions.find(p => p.PERMISSION_ID === PERMISSION_ID);
                    return permission ? perm !== permission.NAME : true;
                })
            })));
        }
    };

    const toggleRolePermission = (RO_ID: number, permissionName: string) => {
        setRoles(roles.map(role => {
            if (role.RO_ID === RO_ID) {
                const hasPermission = role.permissions.includes(permissionName);
                return {
                    ...role,
                    permissions: hasPermission
                        ? role.permissions.filter(p => p !== permissionName)
                        : [...role.permissions, permissionName]
                };
            }
            return role;
        }));
    };

    const toggleRoleExpand = (RO_ID: number) => {
        setExpandedRoles(prev =>
            prev.includes(RO_ID)
                ? prev.filter(id => id !== RO_ID)
                : [...prev, RO_ID]
        );
    };

    const handleBulkPermissionToggle = (RO_ID: number, category: string, grant: boolean) => {
        setRoles(roles.map(role => {
            if (role.RO_ID === RO_ID) {
                const categoryPermissions = permissions
                    .filter(p => p.CATEGORY === category)
                    .map(p => p.NAME);

                if (grant) {
                    // Add all category permissions (remove duplicates)
                    const newPermissions = [...new Set([...role.permissions, ...categoryPermissions])];
                    return { ...role, permissions: newPermissions };
                } else {
                    // Remove all category permissions
                    const newPermissions = role.permissions.filter(perm =>
                        !categoryPermissions.includes(perm)
                    );
                    return { ...role, permissions: newPermissions };
                }
            }
            return role;
        }));
    };

    const isAdminRole = (RO_ID: number) => RO_ID === 8001;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles & Permissions" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Roles & Permissions</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Manage {roles.length} roles and {permissions.length} permissions
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowAddPermission(true)}
                            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-green-700"
                        >
                            <Key className="w-4 h-4" />
                            Add Permission
                        </button>
                        <button
                            onClick={() => setShowAddRole(true)}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4" />
                            Add Role
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{roles.length}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Roles</div>
                    </div>
                    <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{permissions.length}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Permissions</div>
                    </div>
                    <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {categories.length - 1}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Permission Categories</div>
                    </div>
                    <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {roles.reduce((acc, role) => acc + role.permissions.length, 0)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Assignments</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Roles Section with Search */}
                    <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border">
                        <div className="p-6 border-b border-sidebar-border">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-6 h-6 text-blue-600" />
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Roles</h2>
                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full dark:bg-blue-900 dark:text-blue-200">
                                        {filteredRoles.length} roles
                                    </span>
                                </div>
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search roles..."
                                        value={roleSearch}
                                        onChange={(e) => setRoleSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                            {filteredRoles.map(role => (
                                <div key={role.RO_ID} className="border border-sidebar-border rounded-lg">
                                    <div className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <button
                                                        onClick={() => toggleRoleExpand(role.RO_ID)}
                                                        className="text-gray-500 hover:text-gray-700"
                                                    >
                                                        {expandedRoles.includes(role.RO_ID) ?
                                                            <ChevronUp className="w-4 h-4" /> :
                                                            <ChevronDown className="w-4 h-4" />
                                                        }
                                                    </button>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                                        {role.NAME}
                                                        {isAdminRole(role.RO_ID) && (
                                                            <span className="ml-2 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded">
                                                                Protected
                                                            </span>
                                                        )}
                                                    </h3>
                                                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                        {role.permissions.length} permissions
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                    {role.DESCRIPTION}
                                                </p>

                                                {/* Quick Permission Overview */}
                                                <div className="flex flex-wrap gap-1 mb-3">
                                                    {role.permissions.slice(0, 3).map(permission => (
                                                        <span
                                                            key={permission}
                                                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                        >
                                                            {permission}
                                                        </span>
                                                    ))}
                                                    {role.permissions.length > 3 && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                            +{role.permissions.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {!isAdminRole(role.RO_ID) && (
                                                <button
                                                    onClick={() => handleDeleteRole(role.RO_ID)}
                                                    className="ml-4 text-red-600 hover:text-red-800 p-1 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Expanded Permissions View */}
                                        {expandedRoles.includes(role.RO_ID) && (
                                            <div className="mt-4 pt-4 border-t border-sidebar-border">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">Assigned Permissions</h4>
                                                </div>
                                                <div className="space-y-4">
                                                    {Object.entries(getPermissionsByCategory).map(([category, categoryPermissions]) => (
                                                        <div key={category}>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                    {category}
                                                                </span>
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        onClick={() => handleBulkPermissionToggle(role.RO_ID, category, true)}
                                                                        className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded"
                                                                    >
                                                                        Grant All
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleBulkPermissionToggle(role.RO_ID, category, false)}
                                                                        className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded"
                                                                    >
                                                                        Revoke All
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                {categoryPermissions.map(permission => (
                                                                    <div key={permission.PERMISSION_ID} className="flex items-center justify-between p-2 border border-sidebar-border rounded">
                                                                        <div>
                                                                            <div className="text-sm text-gray-900 dark:text-white">
                                                                                {permission.NAME}
                                                                            </div>
                                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                                {permission.DESCRIPTION}
                                                                            </div>
                                                                        </div>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={role.permissions.includes(permission.NAME)}
                                                                            onChange={() => toggleRolePermission(role.RO_ID, permission.NAME)}
                                                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Permissions Section with Search and Filter */}
                    <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border">
                        <div className="p-6 border-b border-sidebar-border">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Key className="w-6 h-6 text-green-600" />
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Permissions</h2>
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full dark:bg-green-900 dark:text-green-200">
                                        {filteredPermissions.length} permissions
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search permissions..."
                                            value={permissionSearch}
                                            onChange={(e) => setPermissionSearch(e.target.value)}
                                            className="w-48 pl-10 pr-4 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-input text-gray-900 dark:text-white"
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
                        <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
                            {Object.entries(getPermissionsByCategory).map(([category, categoryPermissions]) => (
                                <div key={category}>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-medium text-gray-900 dark:text-white">{category}</h3>
                                        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                            {categoryPermissions.length} permissions
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {categoryPermissions.map(permission => (
                                            <div key={permission.PERMISSION_ID} className="flex items-center justify-between p-3 border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent">
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                                                        {permission.NAME}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {permission.DESCRIPTION}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-xs text-gray-500">
                                                            Used by {roles.filter(r => r.permissions.includes(permission.NAME)).length} roles
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeletePermission(permission.PERMISSION_ID)}
                                                    className="text-red-600 hover:text-red-800 p-1 rounded ml-4"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Role-Permission Matrix with Category Tabs */}
                <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border">
                    <div className="p-6 border-b border-sidebar-border">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Users className="w-6 h-6 text-purple-600" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Role-Permission Matrix</h2>
                            </div>
                            <div className="text-sm text-gray-500">
                                {getFilteredPermissionsForMatrix.length} permissions showing
                            </div>
                        </div>

                        {/* Category Tabs */}
                        <div className="flex flex-wrap gap-2 mt-4">
                            <button
                                onClick={() => setActiveMatrixTab('All')}
                                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    activeMatrixTab === 'All'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                            >
                                All Categories
                            </button>
                            {PLATFORM_CATEGORIES.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setActiveMatrixTab(category)}
                                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        activeMatrixTab === category
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 overflow-x-auto">
                        <table className="w-full min-w-full">
                            <thead>
                            <tr className="border-b border-sidebar-border">
                                <th className="text-left p-3 font-medium text-gray-900 dark:text-white">
                                    Permission
                                    <div className="text-xs font-normal text-gray-500 mt-1">
                                        {activeMatrixTab === 'All' ? 'All Categories' : activeMatrixTab}
                                    </div>
                                </th>
                                {filteredRoles.map(role => (
                                    <th key={role.RO_ID} className="text-center p-3 font-medium text-gray-900 dark:text-white">
                                        <div className="flex flex-col items-center">
                                            <span>{role.NAME}</span>
                                            {isAdminRole(role.RO_ID) && (
                                                <span className="text-xs text-red-600 font-normal">(Protected)</span>
                                            )}
                                            <span className="text-xs text-gray-500">
                                                    {role.permissions.length}/{permissions.length}
                                                </span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {getFilteredPermissionsForMatrix.map(permission => (
                                <tr key={permission.PERMISSION_ID} className="border-b border-sidebar-border hover:bg-gray-50 dark:hover:bg-sidebar-accent">
                                    <td className="p-3">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {permission.NAME}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {permission.DESCRIPTION}
                                        </div>
                                        <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                            {permission.CATEGORY}
                                        </div>
                                    </td>
                                    {filteredRoles.map(role => (
                                        <td key={role.RO_ID} className="text-center p-3">
                                            <input
                                                type="checkbox"
                                                checked={role.permissions.includes(permission.NAME)}
                                                onChange={() => toggleRolePermission(role.RO_ID, permission.NAME)}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                disabled={isAdminRole(role.RO_ID) && permission.NAME.includes('admin')}
                                            />
                                            {isAdminRole(role.RO_ID) && permission.NAME.includes('admin') && (
                                                <div className="text-xs text-gray-500 mt-1">Required</div>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        {/* Empty State */}
                        {getFilteredPermissionsForMatrix.length === 0 && (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No permissions found for the selected category.
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Role Modal */}
                {showAddRole && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-sidebar rounded-xl max-w-md w-full border border-sidebar-border">
                            <div className="p-6 border-b border-sidebar-border">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Role</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Role Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={newRole.NAME}
                                        onChange={(e) => setNewRole({ ...newRole, NAME: e.target.value })}
                                        className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                        placeholder="Enter role name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={newRole.DESCRIPTION}
                                        onChange={(e) => setNewRole({ ...newRole, DESCRIPTION: e.target.value })}
                                        className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                        placeholder="Enter role description"
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <div className="p-6 border-t border-sidebar-border flex justify-end gap-3">
                                <button
                                    onClick={() => setShowAddRole(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddRole}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    Add Role
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Permission Modal */}
                {showAddPermission && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-sidebar rounded-xl max-w-md w-full border border-sidebar-border">
                            <div className="p-6 border-b border-sidebar-border">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Permission</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Permission Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={newPermission.NAME}
                                        onChange={(e) => setNewPermission({ ...newPermission, NAME: e.target.value })}
                                        className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                        placeholder="e.g., users.read"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        value={newPermission.DESCRIPTION}
                                        onChange={(e) => setNewPermission({ ...newPermission, DESCRIPTION: e.target.value })}
                                        className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                        placeholder="e.g., View users"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        value={newPermission.CATEGORY}
                                        onChange={(e) => setNewPermission({ ...newPermission, CATEGORY: e.target.value })}
                                        className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                    >
                                        <option value="">Select a category</option>
                                        {PLATFORM_CATEGORIES.map(category => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="p-6 border-t border-sidebar-border flex justify-end gap-3">
                                <button
                                    onClick={() => setShowAddPermission(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddPermission}
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                                >
                                    Add Permission
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
