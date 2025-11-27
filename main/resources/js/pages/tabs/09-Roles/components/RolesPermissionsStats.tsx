interface RolesPermissionsStatsProps {
    roles: any[];
    permissions: any[];
}

export default function RolesPermissionsStats({ roles, permissions }: RolesPermissionsStatsProps) {
    const totalRoles = roles.length;
    const activeRoles = roles.filter(role => role.IS_ACTIVE).length;
    const totalPermissions = permissions.length;
    const userPermissions = permissions.filter(perm => perm.CATEGORY === 'user').length;
    const dataPermissions = permissions.filter(perm => perm.CATEGORY === 'data').length;
    const systemPermissions = permissions.filter(perm => perm.CATEGORY === 'system').length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Roles */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {totalRoles}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Roles</div>
            </div>

            {/* Active Roles */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {activeRoles}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Roles</div>
            </div>

            {/* Total Permissions */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {totalPermissions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Permissions</div>
            </div>

            {/* Permissions by Category */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 whitespace-nowrap">
                    {userPermissions}/{dataPermissions}/{systemPermissions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">User/Data/System Perms</div>
            </div>
        </div>
    );
}
