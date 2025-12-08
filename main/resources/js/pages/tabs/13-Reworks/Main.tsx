import { Head, Link, router } from '@inertiajs/react'; // Added router
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Toaster, toast } from 'sonner'; // Added Toaster/toast

// Import components
import ReworkStats from './ReworkStats';
import SearchAndFilters from './SearchAndFilters';
import ReworkList from './ReworkList';
import ReworkDetailModal from './ReworkDetailModal';

// Import utilities
import { transformReworksData } from './utils';
import { useReworkFilters } from './utils/useReworkFilters';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reworks',
        href: '/reworks',
    },
];
interface Props{
    reworkServiceData: any[];
    reworksData: any[];
    serviceData: any[];
}
export default function Reworks({reworkServiceData, reworksData, serviceData}: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedRework, setSelectedRework] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [reworks, setReworks] = useState(transformReworksData(reworkServiceData, reworksData, serviceData));
    const [viewMode, setViewMode] = useState<'comfortable' | 'compact' | 'condensed'>('comfortable');

    const {
        filteredReworks,
        statuses
    } = useReworkFilters(reworks, searchTerm, statusFilter);

    const handleDeleteRework = (id: number) => {
        setReworks(prev => prev.filter(rework => rework.ID !== id));
        setIsDetailModalOpen(false);
    };

    // ADDED: Handle Status Change
    const handleStatusChange = (id: number, newStatus: string) => {
        // Optimistically update local state
        setReworks(prev =>
            prev.map(rework =>
                rework.ID === id
                    ? { ...rework, STATUS: newStatus }
                    : rework
            )
        );
        // Close modal immediately
        setIsDetailModalOpen(false);
        setSelectedRework(null);
    };

    const openDetailModal = (rework: any) => {
        setSelectedRework(rework);
        setIsDetailModalOpen(true);
    };

    const closeAllModals = () => {
        setIsDetailModalOpen(false);
        setSelectedRework(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reworks" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reworks</h1>
                    <Link
                        href="/reworks/add"
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Rework
                    </Link>
                </div>

                {/* Stats */}
                <ReworkStats reworks={reworks} />

                {/* Search and Filters */}
                <SearchAndFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    statuses={statuses}
                    resultsCount={filteredReworks.length}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                />

                {/* Rework List */}
                <ReworkList
                    reworks={filteredReworks}
                    onReworkClick={openDetailModal}
                    viewMode={viewMode}
                />

                {/* View Detail Modal */}
                {isDetailModalOpen && (
                    <ReworkDetailModal
                        rework={selectedRework}
                        isOpen={isDetailModalOpen}
                        onClose={closeAllModals}
                        onEdit={() => {
                            window.location.href = `/reworks/${selectedRework.ID}/edit`;
                        }}
                        onDelete={handleDeleteRework}
                        onStatusChange={handleStatusChange} // Added Prop
                    />
                )}
            </div>
            {/* Added Toaster for notifications */}
            <Toaster />
        </AppLayout>
    );
}
