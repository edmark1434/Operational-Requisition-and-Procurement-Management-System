import { Grid2x2, LayoutGrid } from 'lucide-react';

interface SearchAndFiltersProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    statusFilter: string;
    setStatusFilter: (filter: string) => void;
    dateFilter: string;
    setDateFilter: (filter: string) => void;
    statuses: string[];
    dateRanges: string[];
    resultsCount: number;
    viewMode: 'comfortable' | 'compact' | 'condensed';
    setViewMode: (mode: 'comfortable' | 'compact' | 'condensed') => void;
}

export default function SearchAndFilters({
                                             searchTerm,
                                             setSearchTerm,
                                             statusFilter,
                                             setStatusFilter,
                                             dateFilter,
                                             setDateFilter,
                                             statuses,
                                             dateRanges,
                                             resultsCount,
                                             viewMode,
                                             setViewMode
                                         }: SearchAndFiltersProps) {
    return (
        <div className="bg-sidebar dark:bg-sidebar rounded-lg border border-sidebar-border p-4 md:p-6">
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
                        placeholder="Search by reference, delivery, or supplier..."
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

                {/* Filters and View Controls Row */}
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                    {/* Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 w-full lg:flex-1">
                        {/* Status Filter */}
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                            >
                                {statuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Date Range
                            </label>
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                            >
                                {dateRanges.map(range => (
                                    <option key={range} value={range}>{range}</option>
                                ))}
                            </select>
                        </div>

                        {/* Results Count */}
                        <div className="flex items-end sm:col-span-2 lg:col-span-2">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium text-gray-900 dark:text-white">{resultsCount}</span> returns found
                            </div>
                        </div>
                    </div>

                    {/* View Mode Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            View:
                        </span>
                        <div className="flex bg-gray-100 dark:bg-sidebar-accent rounded-lg p-1 w-full sm:w-auto">
                            <button
                                onClick={() => setViewMode('comfortable')}
                                className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors flex-1 sm:flex-none ${
                                    viewMode === 'comfortable'
                                        ? 'bg-white dark:bg-sidebar text-gray-900 dark:text-white shadow-sm border border-sidebar-border'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <Grid2x2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Comfortable</span>
                            </button>
                            <button
                                onClick={() => setViewMode('compact')}
                                className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors flex-1 sm:flex-none ${
                                    viewMode === 'compact'
                                        ? 'bg-white dark:bg-sidebar text-gray-900 dark:text-white shadow-sm border border-sidebar-border'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                                <span className="hidden sm:inline">Compact</span>
                            </button>
                            <button
                                onClick={() => setViewMode('condensed')}
                                className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors flex-1 sm:flex-none ${
                                    viewMode === 'condensed'
                                        ? 'bg-white dark:bg-sidebar text-gray-900 dark:text-white shadow-sm border border-sidebar-border'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                <span className="hidden sm:inline">Condensed</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
