import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Toaster, toast } from 'sonner';
import { router } from '@inertiajs/react';

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

    // Initialize state with transformed data
    const [returns, setReturns] = useState(() => transformReturnsData(returnsData, returnsItemData, deliveriesData, suppliersData, itemsData));
    const [viewMode, setViewMode] = useState<'comfortable' | 'compact' | 'condensed'>('comfortable');

    // Custom Hook for filtering
    const {
        filteredReturns,
        statuses,
        dateRanges
    } = useReturnsFilters(returns, searchTerm, statusFilter, dateFilter);

    // --- Handlers ---

    const handleDeleteReturn = (id: number) => {
        router.delete(`/returns/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                // 1. Update local state to remove item from UI immediately
                setReturns(prev => prev.filter(returnItem => returnItem.ID !== id));

                // 2. Close Modal and Reset Selection
                setIsDetailModalOpen(false);
                setSelectedReturn(null);

                // 3. Show Success Notification
                toast.success("Return deleted successfully");
            },
            onError: (errors) => {
                console.error("Delete error:", errors);
                toast.error("Failed to delete return. Please try again.");
            }
        });
    };

    const handleStatusChange = (id: number, newStatus: string) => {
        // 1. Optimistic UI Update (Updates screen immediately)
        setReturns(prevReturns =>
            prevReturns.map(returnItem =>
                returnItem.ID === id
                    ? { ...returnItem, STATUS: newStatus }
                    : returnItem
            )
        );

        // 2. Perform Request
        router.put(`/returns/${id}/status`, { status: newStatus }, {
            onSuccess: () => {
                toast.success(`Return #${id} status updated to ${newStatus}`);
            },
            onError: (errors) => {
                console.error('Error updating status:', errors);
                toast.error("Failed to update status on server.");
                // Optional: Revert UI change here if needed
            }
        });

        // 3. Close modal
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

                {/* View Detail Modal */}
                <ReturnsDetailModal
                    returnItem={selectedReturn}
                    isOpen={isDetailModalOpen}
                    onClose={closeAllModals}
                    onEdit={() => {
                        // FIXED: Uses Inertia router instead of window.location
                        router.visit(`/returns/${selectedReturn?.ID}/edit`);
                    }}
                    onDelete={handleDeleteReturn}
                    onStatusChange={handleStatusChange}
                />
            </div>
            <Toaster/>
        </AppLayout>
    );
}
