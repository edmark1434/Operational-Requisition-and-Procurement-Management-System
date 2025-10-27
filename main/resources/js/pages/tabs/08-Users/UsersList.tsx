// UsersList.tsx
import { LoaderCircle, User, Shield, Calendar, Edit } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface User {
    id: number;
    fullname: string;
    username: string;
    role: string;
    role_description: string;
    created_at: string;
    updated_at: string;
    status: 'active' | 'inactive';
}

interface UsersListProps {
    users: User[];
    isLoading: boolean;
    onUserClick: (user: User) => void;
}

export default function UsersList({ users, isLoading, onUserClick }: UsersListProps) {
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-8">
                <div className="flex items-center justify-center">
                    <LoaderCircle className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">Loading users...</span>
                </div>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-8 text-center">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
                <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-sidebar border-b border-sidebar-border text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="col-span-3">User</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-2">Username</div>
                <div className="col-span-2">Date Created</div>
                <div className="col-span-2">Date Updated</div>
                <div className="col-span-1">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-sidebar-border">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-sidebar transition-colors cursor-pointer"
                        onClick={() => onUserClick(user)}
                    >
                        {/* User Info */}
                        <div className="col-span-3 flex items-center space-x-3">
                            <div className="flex-shrink-0 relative">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                {/* Status Dot */}
                                <div
                                    className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-sidebar ${
                                        user.status === 'active'
                                            ? 'bg-green-500'
                                            : 'bg-red-500'
                                    }`}
                                    title={user.status === 'active' ? 'Active User' : 'Inactive User'}
                                />
                            </div>
                            <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {user.fullname}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {user.role_description}
                                </div>
                            </div>
                        </div>

                        {/* Role */}
                        <div className="col-span-2 flex items-center">
                            <div className="flex items-center space-x-2">
                                <Shield className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-900 dark:text-white capitalize">
                                    {user.role.toLowerCase()}
                                </span>
                            </div>
                        </div>

                        {/* Username */}
                        <div className="col-span-2 flex items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                                @{user.username}
                            </span>
                        </div>

                        {/* Date Created */}
                        <div className="col-span-2 flex items-center">
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        {/* Date Updated */}
                        <div className="col-span-2 flex items-center">
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {new Date(user.updated_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="col-span-1 flex items-center justify-end">
                            <Link
                                href={`/users/${user.id}/edit`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded"
                            >
                                <Edit className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
