import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { requisitions, requisitionform } from '@/routes';
import { type BreadcrumbItem } from '@/types';

// Import your actual datasets
import requisitionsData from '@/pages/datasets/requisition';
import requisitionItemsData from '@/pages/datasets/requisition_item';
import itemsData from '@/pages/datasets/items';
import categoriesData from '@/pages/datasets/category';
import usersData from '@/pages/datasets/user';

// Import components
import RequisitionStats from './RequisitionStats';
import SearchAndFilters from './SearchAndFilters';
import RequisitionsList from './RequisitionsList';
import RequisitionDetailModal from './RequisitionDetailModal';

// Import utilities
import { transformRequisitionData } from './utils';
import { useRequisitionFilters } from './hooks';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Requisitions',
        href: requisitions().url,
    },
];

export default function Requisitions() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [selectedRequisition, setSelectedRequisition] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [requisitions, setRequisitions] = useState(transformRequisitionData());

    const {
        filteredRequisitions,
        statuses,
        priorities,
        allCategories
    } = useRequisitionFilters(requisitions, searchTerm, statusFilter, priorityFilter, categoryFilter);

    const handleStatusUpdate = (id: number, newStatus: string, reason?: string) => {
        setRequisitions(prev =>
            prev.map(req =>
                req.ID === id ? {
                    ...req,
                    STATUS: newStatus,
                    REMARKS: reason || req.REMARKS,
                    UPDATED_AT: new Date().toISOString().slice(0, 19).replace('T', ' ')
                } : req
            )
        );
    };

    const openModal = (requisition: any) => {
        setSelectedRequisition(requisition);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRequisition(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Requisitions" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Requisitions</h1>
                    <Link
                        href={requisitionform().url}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Requisition
                    </Link>
                </div>

                {/* Stats */}
                <RequisitionStats requisitions={requisitions} />

                {/* Search and Filters */}
                <SearchAndFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    priorityFilter={priorityFilter}
                    setPriorityFilter={setPriorityFilter}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    statuses={statuses}
                    priorities={priorities}
                    allCategories={allCategories}
                    resultsCount={filteredRequisitions.length}
                />

                {/* Requisitions List */}
                <RequisitionsList
                    requisitions={filteredRequisitions}
                    onRequisitionClick={openModal}
                />

                {/* Modals */}
                {selectedRequisition && (
                    <RequisitionDetailModal
                        requisition={selectedRequisition}
                        isOpen={isModalOpen}
                        onClose={closeModal}
                        onStatusUpdate={handleStatusUpdate}
                    />
                )}
            </div>
        </AppLayout>
    );
}
