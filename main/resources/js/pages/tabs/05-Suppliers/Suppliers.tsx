import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// Import datasets
import suppliersData from '@/pages/datasets/supplier';
import itemsData from '@/pages/datasets/items';
import categorySuppliersData from '@/pages/datasets/category_supplier';
import categoriesData from '@/pages/datasets/category';

// Import components
import SupplierStats from './SupplierStats';
import SearchAndFilters from './SearchAndFilters';
import SupplierList from './SupplierList';
import SupplierDetailModal from './SupplierDetailModal';

// Import utilities
import { useSupplierFilters } from './hooks';
import { toast, Toaster } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Suppliers',
        href: '/suppliers',
    },
];

interface Prop{
    suppliersData: any[],
    itemsData: any[],
    categorySuppliersData: any[],
    categoriesData: any[],
    success: boolean,
    message:string
}

export default function Suppliers({suppliersData,itemsData,categorySuppliersData,categoriesData,success,message}:Prop) {
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('All');
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [suppliers, setSuppliers] = useState(suppliersData);
    const [viewMode, setViewMode] = useState<'comfortable' | 'compact' | 'condensed'>('comfortable');

    useEffect(() => {
        if (success) {
            toast(message)
        }
    },[])

    // Transform supplier data with additional info
    const transformedSuppliers = suppliers.map(supplier => {
        const supplierItems = itemsData.filter(item => item.SUPPLIER_ID === supplier.ID);
        const supplierCategories = categorySuppliersData
            .filter(cs => cs.SUPPLIER_ID === supplier.ID)
            .map(cs => {
                const category = categoriesData.find(cat => cat.CAT_ID === cs.CATEGORY_ID);
                return category?.NAME || 'Unknown';
            });

        return {
            ...supplier,
            ITEM_COUNT: supplierItems.length,
            CATEGORIES: supplierCategories,
            TOTAL_ITEMS_VALUE: supplierItems.reduce((sum, item) => sum + (item.CURRENT_STOCK * item.UNIT_PRICE), 0)
        };
    });

    const {
        filteredSuppliers,
        paymentOptions
    } = useSupplierFilters(transformedSuppliers, searchTerm, paymentFilter);

    const handleDeleteSupplier = (id: number) => {
        setSuppliers(prev => prev.filter(supplier => supplier.ID !== id));
        setIsDetailModalOpen(false);
    };

    const openDetailModal = (supplier: any) => {
        setSelectedSupplier(supplier);
        setIsDetailModalOpen(true);
    };

    const closeAllModals = () => {
        setIsDetailModalOpen(false);
        setSelectedSupplier(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Suppliers" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suppliers</h1>
                    <Link
                        href="/suppliers/add"
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Supplier
                    </Link>
                </div>

                {/* Stats */}
                <SupplierStats suppliers={transformedSuppliers} />

                {/* Search and Filters */}
                <SearchAndFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    paymentFilter={paymentFilter}
                    setPaymentFilter={setPaymentFilter}
                    paymentOptions={paymentOptions}
                    resultsCount={filteredSuppliers.length}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                />

                {/* Supplier List */}
                <SupplierList
                    suppliers={filteredSuppliers}
                    onSupplierClick={openDetailModal}
                    viewMode={viewMode}
                />

                {/* View Detail Modal */}
                {isDetailModalOpen && (
                    <SupplierDetailModal
                        supplier={selectedSupplier}
                        isOpen={isDetailModalOpen}
                        onClose={closeAllModals}
                        onEdit={() => {
                            window.location.href = `/suppliers/${selectedSupplier.ID}/edit`;
                        }}
                        onDelete={handleDeleteSupplier}
                    />
                )}
            </div>
        <Toaster/>
        </AppLayout>
    );
}
