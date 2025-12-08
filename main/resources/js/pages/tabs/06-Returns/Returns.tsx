import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Toaster, toast } from 'sonner';
// Import components
import ReturnsStats from './ReturnsStats';
import SearchAndFilters from './SearchAndFilters';
import ReturnsList from './ReturnsList';
import ReturnsDetailModal from './ReturnsDetailModal';
import { router } from '@inertiajs/react';
// Import utilities
import { transformReturnsData } from './utils';
import { useReturnsFilters } from './hooks';
import { returnsIndex, reworks } from '@/routes';

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
        // FIXED: Using string interpolation instead of route() helper
        router.delete(`/returns/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                // 2. On Success: Update local state to remove item from UI immediately
                setReturns(prev => prev.filter(returnItem => returnItem.ID !== id));

                // 3. Close Modal and Reset Selection
                setIsDetailModalOpen(false);
                setSelectedReturn(null);

                // 4. Show Success Notification
                toast.success("Return deleted successfully");
            },
            onError: (errors) => {
                console.error("Delete error:", errors);
                toast.error("Failed to delete return. Please try again.");
            }
        });
    };
    // UPDATED: Status Change Handler with explicit modal close
// UPDATED: Status Change Handler
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
        // FIX: Changed URL from '/returns/${id}/update-status' to '/returns/${id}/status'
        router.put(`/returns/${id}/status`, { status: newStatus }, {
            onSuccess: () => {
                toast.success(`Return #${id} status updated to ${newStatus}`);
                // Optional: Refresh data from server to be 100% sure
                // router.reload({ only: ['returnsData'] });
            },
            onError: (errors) => {
                console.error('Error updating status:', errors);
                toast.error("Failed to update status on server.");

                // Optional: Revert UI change on error if needed
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
            <Toaster/>
        </AppLayout>
    );
}
