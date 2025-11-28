interface Permission {
    PERMISSION_ID: string;
    NAME: string;
    DESCRIPTION: string;
    CATEGORY: string;
}

interface Role {
    RO_ID: number;
    NAME: string;
    DESCRIPTION: string;
    IS_ACTIVE: boolean;
    permissions: string[];
    permissionCount: number;
}

interface RolesPermissionsStatsProps {
    roles: Role[];
    permissions: Permission[];
}

export default function RolesPermissionsStats({ roles, permissions }: RolesPermissionsStatsProps) {
    const totalRoles = roles.length;
    const activeRoles = roles.filter(role => role.IS_ACTIVE).length;
    const totalPermissions = permissions.length;

    // Count permissions by major categories (using your actual categories from the dataset)
    const requisitionsPermissions = permissions.filter(perm => perm.CATEGORY === 'Requisitions').length;
    const purchasesPermissions = permissions.filter(perm => perm.CATEGORY === 'Purchases').length;
    const deliveriesPermissions = permissions.filter(perm => perm.CATEGORY === 'Deliveries').length;
    const returnsPermissions = permissions.filter(perm => perm.CATEGORY === 'Returns').length;
    const inventoryPermissions = permissions.filter(perm => perm.CATEGORY === 'Inventory').length;
    const suppliersPermissions = permissions.filter(perm => perm.CATEGORY === 'Suppliers').length;
    const usersPermissions = permissions.filter(perm => perm.CATEGORY === 'Users Management').length;
    const rolesPermissions = permissions.filter(perm => perm.CATEGORY === 'Roles & Permissions').length;
    const settingsPermissions = permissions.filter(perm => perm.CATEGORY === 'Settings').length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3  gap-4">
            {/* Total Roles */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {totalRoles}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Roles</div>
            </div>

            {/* Active Roles 
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {activeRoles}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Roles</div>
            </div>
            */}
            {/* Total Permissions */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {totalPermissions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Permissions</div>
            </div>

            {/* Permission Categories */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {Object.keys([...new Set(permissions.map(perm => perm.CATEGORY))]).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Permission Categories</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                </div>
            </div>
        </div>
    );
}
