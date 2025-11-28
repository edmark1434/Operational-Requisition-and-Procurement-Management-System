import { Link } from '@inertiajs/react';
import { getStatusColor } from '../utils/styleutils';
import { Edit } from 'lucide-react';

interface RolesListProps {
    roles: any[];
    onRoleClick: (role: any) => void;
}

export default function RolesList({ roles, onRoleClick }: RolesListProps) {
    if (roles.length === 0) {
        return (
            <div className="p-8 text-center">
                <div className="text-gray-400 dark:text-gray-600 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No roles found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try adjusting your search.</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-sidebar-border">
            {roles.map((role) => {
                const status = role.IS_ACTIVE ? 'active' : 'inactive';
                const statusText = role.IS_ACTIVE ? 'Active' : 'Inactive';

                return (
                    <div
                        key={role.ID}
                        className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-sidebar transition-colors cursor-pointer"
                        onClick={() => onRoleClick(role)}
                    >
                        {/* Role Info */}
                        <div className="col-span-4 flex items-center space-x-3">
                            <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {role.NAME}
                                </div>
                                {/*<div className="text-xs text-gray-500 dark:text-gray-400">*/}
                                {/*    #{role.ID}*/}
                                {/*</div>*/}
                            </div>
                        </div>

                        {/*/!* Status *!/*/}
                        {/*<div className="col-span-3 flex items-center">*/}
                        {/*    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>*/}
                        {/*        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>*/}
                        {/*        {statusText}*/}
                        {/*    </div>*/}
                        {/*</div>*/}

                        {/* Permissions Count */}
                        <div className="col-span-4 flex items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {role.PERMISSION_COUNT} Click to View Permissions
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="col-span-4 flex items-center justify-end space-x-2">
                            <Link
                                href={`/roles/${role.ID}/edit`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 rounded"
                                title="Edit Role"
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
