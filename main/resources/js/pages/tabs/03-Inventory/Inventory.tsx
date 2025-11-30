import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Toaster, toast } from 'sonner';
// Import datasets
import itemsData from '@/pages/datasets/items';
import categoriesData from '@/pages/datasets/category';

// Import components
import InventoryStats from './InventoryStats';
import SearchAndFilters from './SearchAndFilters';
import InventoryList from './InventoryList';
import InventoryDetailModal from './InventoryDetailModal';

// Import utilities
import { transformInventoryData } from './utils';
import { useInventoryFilters } from './hooks';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory',
        href: '/inventory',
    },
];
interface Prop{
    item: any[],
    success: boolean,
    message:string
}
export default function Inventory({ item, success, message }: Prop) {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [inventory, setInventory] = useState(item || []);
    const [viewMode, setViewMode] = useState<'comfortable' | 'compact' | 'condensed'>('comfortable');

    const {
        filteredInventory,
        categories,
        statuses
    } = useInventoryFilters(inventory, searchTerm, categoryFilter, statusFilter);

    const handleDeleteItem = (id: number) => {
        setInventory(prev => prev.filter(item => item.ID !== id));
        setIsDetailModalOpen(false);
    };

    const openDetailModal = (item: any) => {
        setSelectedItem(item);
        setIsDetailModalOpen(true);
    };

    const closeAllModals = () => {
        setIsDetailModalOpen(false);
        setSelectedItem(null);
    };
    useEffect(() => {
        if (success) {
            toast(message);
       } 
    },[])
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory</h1>
                    <Link
                        href="/inventory/add"
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Item
                    </Link>
                </div>

                {/* Stats */}
                <InventoryStats inventory={inventory} />

                {/* Search and Filters */}
                <SearchAndFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    categories={categories}
                    statuses={statuses}
                    resultsCount={filteredInventory.length}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                />

                {/* Inventory List */}
                <InventoryList
                    inventory={filteredInventory}
                    onItemClick={openDetailModal}
                    viewMode={viewMode}
                />

                {/* View Detail Modal */}
                {isDetailModalOpen && (
                    <InventoryDetailModal
                        item={selectedItem}
                        isOpen={isDetailModalOpen}
                        onClose={closeAllModals}
                        onEdit={() => {
                            // Redirect to edit page
                            window.location.href = `/inventory/${selectedItem.ID}/edit`;
                        }}
                        onDelete={handleDeleteItem}
                    />
                )}
            </div>
            <Toaster/>
        </AppLayout>
    );
}
