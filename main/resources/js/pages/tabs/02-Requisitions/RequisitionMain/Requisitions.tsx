import { Head, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { requisitions as requisitionsRoute, requisitionform } from '@/routes';
import { type BreadcrumbItem } from '@/types';

// Import Components
import RequisitionStats from './RequisitionStats';
import SearchAndFilters from './SearchAndFilters';
import RequisitionsList from './RequisitionsList';
import RequisitionDetailModal from './RequisitionDetailModal';

// --- Types based on your Laravel Controller ---
interface Requisition {
    id: number;
    requestor: string;
    priority: string;
    type: string;
    status: string;
    notes: string;
    remarks?: string;
    created_at: string;
    total_cost: number;
    categories: string[];
}

interface RequisitionsPageProps {
    requisitions: Requisition[]; // Data from Laravel
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Requisitions',
        href: '/requisitions',
    },
];

export default function Requisitions({ requisitions: serverRequisitions }: RequisitionsPageProps) {
    // 1. State for Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');

    // 2. State for Modal
    const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 3. Local state for requisitions (so we can update status instantly on the UI)
    const [localRequisitions, setLocalRequisitions] = useState<Requisition[]>(serverRequisitions || []);

    // --- Filter Logic (Replaces useRequisitionFilters hook) ---
    // We use useMemo so it doesn't slow down the page
    const filteredRequisitions = useMemo(() => {
        return localRequisitions.filter(req => {
            // Search (ID, Requestor, or Notes)
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                req.requestor.toLowerCase().includes(searchLower) ||
                req.id.toString().includes(searchLower) ||
                (req.notes && req.notes.toLowerCase().includes(searchLower));

            // Status Filter
            const matchesStatus = statusFilter === 'All' || req.status.toLowerCase() === statusFilter.toLowerCase();

            // Priority Filter
            const matchesPriority = priorityFilter === 'All' || req.priority.toLowerCase() === priorityFilter.toLowerCase();

            // Category Filter (Checks if the category array contains the selected filter)
            const matchesCategory = categoryFilter === 'All' ||
                (req.categories && req.categories.some(cat => cat.toLowerCase() === categoryFilter.toLowerCase()));

            return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
        });
    }, [localRequisitions, searchTerm, statusFilter, priorityFilter, categoryFilter]);

    // --- Extract Unique Values for Dropdowns ---
    const statuses = useMemo(() => ['All', ...Array.from(new Set(localRequisitions.map(r => r.status)))], [localRequisitions]);
    const priorities = useMemo(() => ['All', ...Array.from(new Set(localRequisitions.map(r => r.priority)))], [localRequisitions]);
    const allCategories = useMemo(() => {
        const cats = new Set<string>();
        localRequisitions.forEach(r => r.categories?.forEach(c => cats.add(c)));
        return ['All', ...Array.from(cats)];
    }, [localRequisitions]);


    // --- Handlers ---
    const handleStatusUpdate = (id: number, newStatus: string, reason?: string) => {
        // Update local state immediately (Optimistic UI)
        setLocalRequisitions(prev =>
            prev.map(req =>
                req.id === id ? {
                    ...req,
                    status: newStatus,
                    remarks: reason || req.remarks,
                    // Note: In a real app, you should also trigger a router.post() here to save to DB
                } : req
            )
        );
    };

    const openModal = (requisition: Requisition) => {
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

                {/* Stats - Uses the real filtered data now */}
                <RequisitionStats requisitions={localRequisitions} />

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
