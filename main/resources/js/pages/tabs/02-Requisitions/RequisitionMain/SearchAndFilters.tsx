interface SearchAndFiltersProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    statusFilter: string;
    setStatusFilter: (filter: string) => void;
    priorityFilter: string;
    setPriorityFilter: (filter: string) => void;
    categoryFilter: string;
    setCategoryFilter: (filter: string) => void;
    statuses: string[];
    priorities: string[];
    allCategories: string[];
    resultsCount: number;
}

export default function SearchAndFilters({
                                             searchTerm,
                                             setSearchTerm,
                                             statusFilter,
                                             setStatusFilter,
                                             priorityFilter,
                                             setPriorityFilter,
                                             categoryFilter,
                                             setCategoryFilter,
                                             statuses,
                                             priorities,
                                             allCategories,
                                             resultsCount
                                         }: SearchAndFiltersProps) {

    const getStatusDisplayName = (status: string): string => {
        const statusMap: { [key: string]: string } = {
            'pending': 'Pending',
            'approved': 'Approved',
            'rejected': 'Rejected',
            'partially_approved': 'Partially Approved',
            'ordered': 'Ordered',
            'delivered': 'Delivered',
            'awaiting_pickup': 'Awaiting Pickup',
            'received': 'Received',
            'all': 'All Statuses'
        };
        return statusMap[status?.toLowerCase()] || status;
    };

    return (
        <div className="bg-sidebar dark:bg-sidebar rounded-lg border border-sidebar-border p-6">
            <div className="space-y-4">
                {/* Enhanced Search */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search requisitions, items, services, requestors, or ID..."
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                        >
                            {statuses.map(status => (
                                <option key={status} value={status}>
                                    {getStatusDisplayName(status)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Priority Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Priority
                        </label>
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                        >
                            {priorities.map(priority => (
                                <option key={priority} value={priority}>{priority}</option>
                            ))}
                        </select>
                    </div>

                    {/* Category Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Category
                        </label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                        >
                            {allCategories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>

                    {/* Results Count */}
                    <div className="flex items-end">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium text-gray-900 dark:text-white">{resultsCount}</span> requisitions found
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
