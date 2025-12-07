import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// Import components
import ReturnsStats from './ReturnsStats';
import SearchAndFilters from './SearchAndFilters';
import ReturnsList from './ReturnsList';
import ReturnsDetailModal from './ReturnsDetailModal';

// Import utilities
import { transformReturnsData } from './utils';
import { useReturnsFilters } from './hooks';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Returns',
        href: '/returns',
    },
];
interface Props{
    returnsData: any[],
    returnsItemData: any[],
    deliveriesData: any[],
    suppliersData: any[],
    itemsData: any[],
}
export default function Returns({
    returnsData,
    returnsItemData,
    deliveriesData,
    suppliersData,
    itemsData,
}: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('All');
    const [selectedReturn, setSelectedReturn] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [returns, setReturns] = useState(() => transformReturnsData(returnsData, returnsItemData, deliveriesData, suppliersData, itemsData));
    const [viewMode, setViewMode] = useState<'comfortable' | 'compact' | 'condensed'>('comfortable');
    console.log('Returns:', returns);
    const {
        filteredReturns,
        statuses,
        dateRanges
    } = useReturnsFilters(returns, searchTerm, statusFilter, dateFilter);

    const handleDeleteReturn = (id: number) => {
        setReturns(prev => prev.filter(returnItem => returnItem.ID !== id));
        setIsDetailModalOpen(false);
    };

    // UPDATED: Status Change Handler with explicit modal close
    const handleStatusChange = (id: number, newStatus: string) => {
        setReturns(prevReturns =>
            prevReturns.map(returnItem =>
                returnItem.ID === id
                    ? { ...returnItem, STATUS: newStatus }
                    : returnItem
            )
        );
        // Close modal immediately after status change
        setIsDetailModalOpen(false);
        setSelectedReturn(null);
    };

    const openDetailModal = (returnItem: any) => {
        setSelectedReturn(returnItem);
        setIsDetailModalOpen(true);
    };

    const closeAllModals = () => {
        setIsDetailModalOpen(false);
        setSelectedReturn(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Returns" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Returns</h1>
                    <Link
                        href="/returns/add"
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Return Slip
                    </Link>
                </div>

                {/* Stats */}
                <ReturnsStats returns={returns} />

                {/* Search and Filters */}
                <SearchAndFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                    statuses={statuses}
                    dateRanges={dateRanges}
                    resultsCount={filteredReturns.length}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                />

                {/* Returns List */}
                <ReturnsList
                    returns={filteredReturns}
                    onReturnClick={openDetailModal}
                    viewMode={viewMode}
                />

                {/* View Detail Modal - REMOVED the conditional rendering */}
                <ReturnsDetailModal
                    returnItem={selectedReturn}
                    isOpen={isDetailModalOpen}
                    onClose={closeAllModals}
                    onEdit={() => {
                        window.location.href = `/returns/${selectedReturn?.ID}/edit`;
                    }}
                    onDelete={handleDeleteReturn}
                    onStatusChange={handleStatusChange}
                />
            </div>
        </AppLayout>
    );
}
