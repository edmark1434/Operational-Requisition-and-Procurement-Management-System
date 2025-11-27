import { Link } from '@inertiajs/react';
import { getPermissionCategoryColor } from '../utils/styleutils';
import { Edit } from 'lucide-react';

interface PermissionsListProps {
    permissions: any[];
    onPermissionClick: (permission: any) => void;
}

export default function PermissionsList({ permissions, onPermissionClick }: PermissionsListProps) {
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
        <div className="divide-y divide-sidebar-border">
            {permissions.map((permission) => {
                const categoryText = permission.CATEGORY.charAt(0).toUpperCase() + permission.CATEGORY.slice(1);

                return (
                    <div
                        key={permission.ID}
                        className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-sidebar transition-colors cursor-pointer"
                        onClick={() => onPermissionClick(permission)}
                    >
                        {/* Permission Info */}
                        <div className="col-span-4 flex items-center space-x-3">
                            <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {permission.NAME.replace(/_/g, ' ')}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    #{permission.ID}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="col-span-3 flex items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {permission.DESCRIPTION}
                            </span>
                        </div>

                        {/* Category */}
                        <div className="col-span-2 flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPermissionCategoryColor(permission.CATEGORY)}`}>
                                {categoryText}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="col-span-3 flex items-center justify-end space-x-2">
                            <Link
                                href={`/roles-permissions/permission/${permission.ID}/edit`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 rounded"
                                title="Edit Permission"
                            >
                                <Edit className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
