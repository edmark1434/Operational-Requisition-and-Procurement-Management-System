import { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { roles } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Plus, Shield, Key, Users, Trash2, Search, Edit3, Check, X, Filter } from 'lucide-react';

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

// Updated platform categories based on the new permissions
const PLATFORM_CATEGORIES = [
    'Requisitions',
    'Purchases',
    'Deliveries',
    'Returns',
    'Inventory',
    'Suppliers',
    'Users Management',
    'Roles & Permissions',
    'Settings'
];

export default function RolePerm() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [showAddRole, setShowAddRole] = useState(false);
    const [newRole, setNewRole] = useState({ NAME: '', DESCRIPTION: '', permissions: [] as string[] });
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    // Search and filter states
    const [roleSearch, setRoleSearch] = useState('');
    const [permissionSearch, setPermissionSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [expandedRoles, setExpandedRoles] = useState<number[]>([]);
    const [activeMatrixTab, setActiveMatrixTab] = useState('All');
    const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

    // Load data from datasets
    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        // Transform permissions data
        const transformedPermissions: Permission[] = permissionsData.map(perm => {
            return {
                PERMISSION_ID: perm.PERMISSION_ID,
                NAME: perm.NAME,
                DESCRIPTION: perm.DESCRIPTION,
                CATEGORY: perm.CATEGORY || 'General'
            };
        });

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
                permissions: rolePerms
            };
        });

        setPermissions(transformedPermissions);
        setRoles(transformedRoles);
        // Select all roles by default for matrix
        setSelectedRoles(transformedRoles.map(role => role.RO_ID));
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

    const filteredRolesForMatrix = useMemo(() => {
        return roles.filter(role => selectedRoles.includes(role.RO_ID));
    }, [roles, selectedRoles]);

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

    const handleEditRole = (role: Role) => {
        setEditingRole(role);
        setNewRole({ NAME: role.NAME, DESCRIPTION: role.DESCRIPTION, permissions: role.permissions });
        setShowAddRole(true);
    };

    const handleUpdateRole = () => {
        if (editingRole && newRole.NAME.trim()) {
            setRoles(roles.map(role =>
                role.RO_ID === editingRole.RO_ID
                    ? { ...role, NAME: newRole.NAME, DESCRIPTION: newRole.DESCRIPTION, permissions: newRole.permissions }
                    : role
            ));
            setEditingRole(null);
            setNewRole({ NAME: '', DESCRIPTION: '', permissions: [] });
            setShowAddRole(false);
        }
    };

    const handleDeleteRole = (RO_ID: number) => {
        if (RO_ID === 8001) {
            alert('Cannot delete the Admin role!');
            return;
        }
        if (window.confirm('Are you sure you want to delete this role?')) {
            setRoles(roles.filter(role => role.RO_ID !== RO_ID));
            // Remove from selected roles if it was selected
            setSelectedRoles(selectedRoles.filter(id => id !== RO_ID));
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

    const toggleModalPermission = (permissionName: string) => {
        setNewRole(prev => {
            const hasPermission = prev.permissions.includes(permissionName);
            return {
                ...prev,
                permissions: hasPermission
                    ? prev.permissions.filter(p => p !== permissionName)
                    : [...prev.permissions, permissionName]
            };
        });
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

    const handleModalBulkPermissionToggle = (category: string, grant: boolean) => {
        setNewRole(prev => {
            const categoryPermissions = permissions
                .filter(p => p.CATEGORY === category)
                .map(p => p.NAME);

            if (grant) {
                // Add all category permissions (remove duplicates)
                const newPermissions = [...new Set([...prev.permissions, ...categoryPermissions])];
                return { ...prev, permissions: newPermissions };
            } else {
                // Remove all category permissions
                const newPermissions = prev.permissions.filter(perm =>
                    !categoryPermissions.includes(perm)
                );
                return { ...prev, permissions: newPermissions };
            }
        });
    };

    const toggleRoleSelection = (RO_ID: number) => {
        setSelectedRoles(prev =>
            prev.includes(RO_ID)
                ? prev.filter(id => id !== RO_ID)
                : [...prev, RO_ID]
        );
    };

    const isAdminRole = (RO_ID: number) => RO_ID === 8001;
    const isDefaultRole = (RO_ID: number) => [8001, 8002, 8003, 8004].includes(RO_ID);

    const getRoleBadgeColor = (roleName: string) => {
        switch (roleName) {
            case 'Admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'Manager': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'Encoder': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'User': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
            default: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
        }
    };

    const hasPermission = (role: Role, permissionName: string) => {
        return role.permissions.includes(permissionName);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles & Permissions" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Roles & Permissions</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Manage {roles.length} roles and {permissions.length} permissions across the system
                        </p>
                    </div>
                    <div className="flex gap-3">
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
                        <div className="flex items-center gap-3">
                            <Shield className="w-6 h-6 text-blue-600" />
                            <div>
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{roles.length}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Total Roles</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                        <div className="flex items-center gap-3">
                            <Key className="w-6 h-6 text-green-600" />
                            <div>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{permissions.length}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Total Permissions</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                        <div className="flex items-center gap-3">
                            <Users className="w-6 h-6 text-purple-600" />
                            <div>
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {categories.length - 1}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 flex items-center justify-center bg-orange-100 rounded-full">
                                <span className="text-orange-600 text-sm font-bold">∑</span>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {roles.reduce((acc, role) => acc + role.permissions.length, 0)}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Total Assignments</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Simplified Roles Section */}
                    <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border">
                        <div className="p-6 border-b border-sidebar-border">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">System Roles</h2>
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
                                <div key={role.RO_ID} className="border border-sidebar-border rounded-lg hover:shadow-md transition-shadow p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(role.NAME)}`}>
                                                    {role.NAME}
                                                </span>
                                                {isDefaultRole(role.RO_ID) && (
                                                    <span className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 px-2 py-1 rounded">
                                                        Default
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                    {role.permissions.length} permissions
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {role.DESCRIPTION}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 ml-4">
                                            <button
                                                onClick={() => handleEditRole(role)}
                                                className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                                                title="Edit role"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            {!isAdminRole(role.RO_ID) && (
                                                <button
                                                    onClick={() => handleDeleteRole(role.RO_ID)}
                                                    className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                                                    title="Delete role"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Permissions Overview Section */}
                    <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border">
                        <div className="p-6 border-b border-sidebar-border">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Permissions Overview</h2>
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full dark:bg-green-900 dark:text-green-200">
                                        {permissions.length} permissions
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
                                            <div key={permission.PERMISSION_ID} className="flex items-center justify-between p-3 border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent transition-colors">
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                                                        {permission.NAME.replace(/_/g, ' ')}
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
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Role-Permission Matrix - VIEW ONLY */}
                <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border">
                    <div className="p-6 border-b border-sidebar-border">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Role-Permission Matrix</h2>
                                <span className="text-sm text-gray-500">
                                    View-only overview • {selectedRoles.length} roles selected
                                </span>
                            </div>
                        </div>

                        {/* Enhanced Filter Controls */}
                        <div className="flex flex-wrap gap-4 items-center">
                            {/* Category Filter */}
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Category:</span>
                                <select
                                    value={activeMatrixTab}
                                    onChange={(e) => setActiveMatrixTab(e.target.value)}
                                    className="px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                >
                                    <option value="All">All Categories</option>
                                    {PLATFORM_CATEGORIES.map(category => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Quick Role Toggles */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Roles:</span>
                                <div className="flex flex-wrap gap-1">
                                    {roles.map(role => (
                                        <button
                                            key={role.RO_ID}
                                            onClick={() => toggleRoleSelection(role.RO_ID)}
                                            className={`px-2 py-1 text-xs rounded transition-colors ${
                                                selectedRoles.includes(role.RO_ID)
                                                    ? getRoleBadgeColor(role.NAME)
                                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            {role.NAME}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="overflow-x-auto max-h-[600px] overflow-y-auto border border-sidebar-border rounded-lg">
                            <table className="w-full min-w-full">
                                <thead className="sticky top-0 bg-white dark:bg-sidebar z-10">
                                <tr className="border-b border-sidebar-border">
                                    <th className="text-left p-4 font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-sidebar z-20 border-r border-sidebar-border min-w-80">
                                        Permission
                                        <div className="text-xs font-normal text-gray-500 mt-1">
                                            {activeMatrixTab === 'All' ? 'All Categories' : activeMatrixTab}
                                        </div>
                                    </th>
                                    {filteredRolesForMatrix.map(role => (
                                        <th key={role.RO_ID} className="text-center p-4 font-medium text-gray-900 dark:text-white min-w-40">
                                            <div className="flex flex-col items-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(role.NAME)}`}>
                                                        {role.NAME}
                                                    </span>
                                                {isDefaultRole(role.RO_ID) && (
                                                    <span className="text-xs text-gray-500 font-normal mt-1">(Default)</span>
                                                )}
                                                <span className="text-xs text-gray-500 mt-1">
                                                        {role.permissions.length} perms
                                                    </span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {getFilteredPermissionsForMatrix.map(permission => (
                                    <tr key={permission.PERMISSION_ID} className="border-b border-sidebar-border hover:bg-gray-50 dark:hover:bg-sidebar-accent">
                                        <td className="p-4 sticky left-0 bg-white dark:bg-sidebar z-10 border-r border-sidebar-border min-w-80">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {permission.NAME.replace(/_/g, ' ')}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {permission.DESCRIPTION}
                                            </div>
                                            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                                {permission.CATEGORY}
                                            </div>
                                        </td>
                                        {filteredRolesForMatrix.map(role => (
                                            <td key={role.RO_ID} className="text-center p-4 min-w-40">
                                                <div className="flex justify-center">
                                                    {hasPermission(role, permission.NAME) ? (
                                                        <Check className="w-5 h-5 text-green-600" />
                                                    ) : (
                                                        <X className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Empty State */}
                        {getFilteredPermissionsForMatrix.length === 0 && (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No permissions found for the selected category.
                            </div>
                        )}
                        {filteredRolesForMatrix.length === 0 && (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                Please select at least one role to display the matrix.
                            </div>
                        )}
                    </div>
                </div>

                {/* Add/Edit Role Modal with Permission Management */}
                {showAddRole && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-sidebar rounded-xl max-w-4xl w-full border border-sidebar-border max-h-[90vh] flex flex-col">
                            <div className="p-6 border-b border-sidebar-border">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {editingRole ? 'Edit Role' : 'Add New Role'}
                                </h3>
                            </div>

                            <div className="flex-1 overflow-hidden">
                                <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                                    {/* Left Column - Role Details */}
                                    <div className="p-6 border-r border-sidebar-border">
                                        <div className="space-y-4">
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
                                                    rows={4}
                                                />
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Permissions ({newRole.permissions.length} selected)
                                                    </label>
                                                    <div className="text-xs text-gray-500">
                                                        {newRole.permissions.length} of {permissions.length} permissions
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column - Permission Management */}
                                    <div className="p-6 overflow-y-auto max-h-[400px]">
                                        <div className="space-y-4">
                                            {Object.entries(getPermissionsByCategory).map(([category, categoryPermissions]) => (
                                                <div key={category} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {category}
                                                            </span>
                                                            <span className="text-xs text-gray-500 ml-2">
                                                                {categoryPermissions.length} permissions
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => handleModalBulkPermissionToggle(category, true)}
                                                                className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                                                            >
                                                                Select All
                                                            </button>
                                                            <button
                                                                onClick={() => handleModalBulkPermissionToggle(category, false)}
                                                                className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                                                            >
                                                                Clear All
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {categoryPermissions.map(permission => (
                                                            <div key={permission.PERMISSION_ID} className="flex items-center justify-between p-2 border border-sidebar-border rounded bg-white dark:bg-sidebar hover:bg-gray-50 dark:hover:bg-sidebar-accent transition-colors">
                                                                <div className="flex-1">
                                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                        {permission.NAME.replace(/_/g, ' ')}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {permission.DESCRIPTION}
                                                                    </div>
                                                                </div>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={newRole.permissions.includes(permission.NAME)}
                                                                    onChange={() => toggleModalPermission(permission.NAME)}
                                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-sidebar-border flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowAddRole(false);
                                        setEditingRole(null);
                                        setNewRole({ NAME: '', DESCRIPTION: '', permissions: [] });
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={editingRole ? handleUpdateRole : handleAddRole}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    {editingRole ? 'Update Role' : 'Add Role'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
