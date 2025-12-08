import {Head, Link, router} from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// Import components
import PurchaseStats from './PurchaseStats';
import PurchaseFilters from './PurchaseFilters';
import PurchaseList from './PurchaseList';
import PurchaseDetailModal from './PurchaseDetailModal';

// Import utilities
import { usePurchaseFilters } from './hooks/usePurchaseFilters';
import { purchaseOrdersData } from '@/pages/datasets/purchase_order';
import {orderdelete, servicedelete} from "@/routes";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Purchases',
        href: '/purchases',
    },
];

export interface Category {
    id: number;
    name: string;
    description: string | null;
    type: "Items" | "Services";
    is_active: boolean;
}

interface Prop{
    purchaseOrdersData:any[],
    categories: Category[],
}
export default function Purchases({purchaseOrdersData, categories}:Prop) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [supplierFilter, setSupplierFilter] = useState('All');
    const [orderTypeFilter, setOrderTypeFilter] = useState('All');
    const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [purchases, setPurchases] = useState(purchaseOrdersData);
    const [viewMode, setViewMode] = useState<'comfortable' | 'compact' | 'condensed'>('comfortable');
    console.log("Purchases Data:", purchases);
    const {
        filteredPurchases,
        statuses,
        suppliers,
        orderTypes
    } = usePurchaseFilters(purchases, searchTerm, statusFilter, supplierFilter, orderTypeFilter);

    const handleDeletePurchase = (id: number) => {
        router.delete(orderdelete(id).url);
        alert('Purchase order deleted successfully!');
        setPurchases(prev => prev.filter(purchase => purchase.ID !== id));
        setIsDetailModalOpen(false);
    };

    const handleStatusChange = (id: number, newStatus: string) => {
        setPurchases(prev => prev.map(purchase =>
            purchase.ID === id
                ? { ...purchase, STATUS: newStatus, UPDATED_AT: new Date().toISOString() }
                : purchase
        ));
        setIsDetailModalOpen(false);
    };

    const openDetailModal = (purchase: any) => {
        setSelectedPurchase(purchase);
        setIsDetailModalOpen(true);
    };

    const closeAllModals = () => {
        setIsDetailModalOpen(false);
        setSelectedPurchase(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Purchases" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Purchase Orders</h1>
                    <Link
                        href="/purchases/create"
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Purchase Order
                    </Link>
                </div>

                {/* Stats */}
                <PurchaseStats purchases={purchases} />

                {/* Search and Filters */}
                <PurchaseFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    supplierFilter={supplierFilter}
                    setSupplierFilter={setSupplierFilter}
                    orderTypeFilter={orderTypeFilter}
                    setOrderTypeFilter={setOrderTypeFilter}
                    statuses={statuses}
                    suppliers={suppliers}
                    orderTypes={orderTypes}
                    resultsCount={filteredPurchases.length}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                />

                {/* Purchase List */}
                <PurchaseList
                    purchases={filteredPurchases}
                    onPurchaseClick={openDetailModal}
                    viewMode={viewMode}
                />

                {/* View Detail Modal */}
                {isDetailModalOpen && (
                    <PurchaseDetailModal
                        purchase={selectedPurchase}
                        isOpen={isDetailModalOpen}
                        onClose={closeAllModals}
                        onEdit={() => {
                            window.location.href = `/purchases/${selectedPurchase.ID}/edit`;
                        }}
                        onDelete={handleDeletePurchase}
                        onStatusChange={handleStatusChange}
                        categories={categories}
                    />
                )}
            </div>
        </AppLayout>
    );
}
