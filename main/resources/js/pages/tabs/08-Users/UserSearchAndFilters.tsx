// components/UserSearchAndFilters.tsx
import { Search } from 'lucide-react';

interface UserSearchAndFiltersProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    roleFilter: string;
    setRoleFilter: (filter: string) => void;
    statusFilter: string;
    setStatusFilter: (filter: string) => void;
    resultsCount: number;
    availableRoles: string[];
}

export default function UserSearchAndFilters({
                                                 searchTerm,
                                                 setSearchTerm,
                                                 roleFilter,
                                                 setRoleFilter,
                                                 statusFilter,
                                                 setStatusFilter,
                                                 resultsCount,
                                                 availableRoles // Added this missing prop
                                             }: UserSearchAndFiltersProps) {
    const statuses = ['All', 'active', 'inactive'];

    return (
        <div className="bg-sidebar dark:bg-sidebar rounded-lg border border-sidebar-border p-6">
            <div className="space-y-4">
                {/* Enhanced Search */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search users by name or username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                            <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/*/!* Role Filter *!/*/}
                    {/*<div>*/}
                    {/*    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">*/}
                    {/*        Role*/}
                    {/*    </label>*/}
                    {/*    <select*/}
                    {/*        value={roleFilter}*/}
                    {/*        onChange={(e) => setRoleFilter(e.target.value)}*/}
                    {/*        className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"*/}
                    {/*    >*/}
                    {/*        {availableRoles.map(role => (*/}
                    {/*            <option key={role} value={role}>*/}
                    {/*                {role === 'All' ? 'All Roles' : role}*/}
                    {/*            </option>*/}
                    {/*        ))}*/}
                    {/*    </select>*/}
                    {/*</div>*/}

                    {/*/!* Status Filter *!/*/}
                    {/*<div>*/}
                    {/*    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">*/}
                    {/*        Status*/}
                    {/*    </label>*/}
                    {/*    <select*/}
                    {/*        value={statusFilter}*/}
                    {/*        onChange={(e) => setStatusFilter(e.target.value)}*/}
                    {/*        className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"*/}
                    {/*    >*/}
                    {/*        {statuses.map(status => (*/}
                    {/*            <option key={status} value={status}>*/}
                    {/*                {status === 'active' ? 'Active' : status === 'inactive' ? 'Inactive' : 'All Status'}*/}
                    {/*            </option>*/}
                    {/*        ))}*/}
                    {/*    </select>*/}
                    {/*</div>*/}

                    {/*/!* Results Count *!/*/}
                    {/*<div className="flex items-end">*/}
                    {/*    <div className="text-sm text-gray-600 dark:text-gray-400">*/}
                    {/*        <span className="font-medium text-gray-900 dark:text-white">{resultsCount}</span> users found*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                </div>
            </div>
        </div>
    );
}
