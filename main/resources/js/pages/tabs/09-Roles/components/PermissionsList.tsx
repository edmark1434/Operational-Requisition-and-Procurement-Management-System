interface PermissionsListProps {
    permissions: any[];
    getPermissionsByCategory: { [key: string]: any[] };
}

export default function PermissionsList({ permissions, getPermissionsByCategory }: PermissionsListProps) {
    if (permissions.length === 0) {
        return (
            <div className="p-8 text-center">
                <div className="text-gray-400 dark:text-gray-600 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No permissions found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try adjusting your search.</p>
            </div>
        );
    }

    return (
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
                                </div>
                                <div className="text-xs text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                                    #{permission.PERMISSION_ID}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
