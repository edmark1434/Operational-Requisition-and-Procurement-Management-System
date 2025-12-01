import { Head, Link } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react'; // Ensure useEffect is imported
import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';
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
    ref_no?: string;
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
    dbCategories: string[];      // Master list of categories from Laravel
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Requisitions',
        href: '/requisitions',
    },
];

export default function Requisitions({
                                         requisitions: serverRequisitions,
                                         dbCategories = []
                                     }: RequisitionsPageProps) {

    // 1. State for Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');

    // 2. State for Modal
    const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 3. Local state for requisitions
    const [localRequisitions, setLocalRequisitions] = useState<Requisition[]>(serverRequisitions || []);

    // =========================================================================
    // FIX #1: Sync local state when serverRequisitions prop changes
    // =========================================================================
    useEffect(() => {
        setLocalRequisitions(serverRequisitions || []);
    }, [serverRequisitions]);


    // --- Filter Logic ---
    const filteredRequisitions = useMemo(() => {
        return localRequisitions.filter(req => {
            const searchLower = searchTerm.toLowerCase();

            const matchesSearch =
                (req.ref_no && req.ref_no.toLowerCase().includes(searchLower)) ||
                req.requestor.toLowerCase().includes(searchLower) ||
                req.id.toString().includes(searchLower) ||
                (req.notes && req.notes.toLowerCase().includes(searchLower));

            // FIX: Replace underscores with spaces for safe comparison (e.g. 'partially_approved' vs 'Partially Approved')
            const dbStatus = req.status.toLowerCase().replace(/_/g, ' ');
            const filterStatus = statusFilter.toLowerCase().replace(/_/g, ' ');

            const matchesStatus = statusFilter === 'All' || dbStatus === filterStatus;

            const matchesPriority = priorityFilter === 'All' || req.priority.toLowerCase() === priorityFilter.toLowerCase();
            const matchesCategory = categoryFilter === 'All' ||
                (req.categories && req.categories.some(cat => cat.toLowerCase() === categoryFilter.toLowerCase()));

            return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
        });
    }, [localRequisitions, searchTerm, statusFilter, priorityFilter, categoryFilter]);

    // --- Dropdown Values ---
    const statuses = [
        'All', 'pending', 'approved', 'partially_approved',
        'rejected', 'ordered', 'awaiting_pickup', 'delivered', 'received'
    ];
    const priorities = ['All', 'Low', 'Normal', 'High'];
    const allCategories = ['All', ...dbCategories];

    // --- Handlers ---
    const handleStatusUpdate = (id: number, newStatus: string, reason?: string) => {

        // FIX #2: Optimistically update local state for instant UI feedback
        setLocalRequisitions(prevItems => prevItems.map(item =>
            item.id === id
                ? { ...item, status: newStatus, remarks: reason || item.remarks }
                : item
        ));

        // INSTANTLY Update the Modal (The Popup)
        if (selectedRequisition && selectedRequisition.id === id) {
            setSelectedRequisition(prev => prev ? ({
                ...prev,
                status: newStatus,
                remarks: reason || prev.remarks
            }) : null);
        }

        // Send Request to Backend (Background Sync)
        router.put(`/requisitions/${id}/status`, {
            status: newStatus,
            reason: reason
        }, {
            preserveScroll: true,
            onSuccess: () => {
                // The useEffect (Fix #1) will handle the final data sync automatically
                console.log("Synced with server");
            },
            onError: () => {
                alert("Failed to save status. Reloading page.");
                // If it failed, reload to get the real data back
                router.reload();
            }
        });
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

                {/* Stats */}
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
