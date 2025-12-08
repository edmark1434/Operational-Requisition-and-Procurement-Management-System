import {Head, Link, router, usePage} from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// Import components
import DeliveriesStats from './DeliveriesStats';
import SearchAndFilters from './SearchAndFilters';
import DeliveriesList from './DeliveriesList';
import DeliveriesDetailModal from './DeliveriesDetailModal';

// Import utilities
import { transformDeliveriesData } from './utils';
import { useDeliveriesFilters } from './hooks';
import deliveryItems from '@/pages/datasets/delivery_items';
import {deliverydelete, orderdelete} from "@/routes";

export interface Item {
    id: number;
    barcode: string | null;
    name: string;
    dimensions: string | null;
    unit_price: number;
    current_stock: number;
    is_active: boolean;
    make_id: number | null;
    category_id: number;
    vendor_id: number | null;
}

export interface Service {
    id: number;
    name: string;
    description: string;
    hourly_rate: number;
    is_active: boolean;
    category_id: number;
    vendor_id: number | null;
}

// Add proper TypeScript interfaces
interface Delivery {
    id: number;
    type: string;
    delivery_date: string;
    total_cost: number;
    receipt_no: string;
    receipt_photo: string | null;
    status: string;
    remarks: string | null;
    po_id: number | null;
    purchase_order: any;
}

export interface DeliveryItem {
    id: number;
    delivery_id: number | null;
    item_id: number | null;
    item: Item;
    quantity: number;
    unit_price: number;
}

export interface DeliveryService {
    id: number;
    delivery_id: number;
    service_id: number;
    service: Service;
    item_id: number | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Deliveries',
        href: '/deliveries',
    },
];

export default function Deliveries() {
    const { deliveries: backendDeliveries, types, statuses,deliveryItems, deliveryServices } = usePage<{
        deliveries: Delivery[];
        types: string[];
        statuses: string[];
        deliveryItems: DeliveryItem[];
        deliveryServices: DeliveryService[];
    }>().props;
    const [deliveries, setDeliveries] = useState<Delivery[]>(backendDeliveries);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('All');
    const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
    const [selectedDeliveryItem, setSelectedDeliveryItem] = useState<DeliveryItem[]>([]);
    const [selectedDeliveryService, setSelectedDeliveryService] = useState<DeliveryService[]>([]);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'comfortable' | 'compact' | 'condensed'>('comfortable');

    const {filteredDeliveries, dateRanges} = useDeliveriesFilters(deliveries, searchTerm, statusFilter, dateFilter, typeFilter);

    const handleDeleteDelivery = (id: number) => {
        router.delete(deliverydelete(id).url);
        alert('Purchase order deleted successfully!');
        setDeliveries(prev => prev.filter(delivery => delivery.id !== id));
        setIsDetailModalOpen(false);
    };

    // Add this function to handle status changes
    const handleStatusChange = (deliveryId: number, newStatus: string) => {
        setDeliveries(prev =>
            prev.map(delivery =>
                delivery.id === deliveryId
                    ? { ...delivery, status: newStatus }
                    : delivery
            )
        );

        // Update selected delivery if it's the one being changed
        if (selectedDelivery && selectedDelivery.id === deliveryId) {
            setSelectedDelivery({ ...selectedDelivery, status: newStatus });
        }

        // In a real application, you would also make an API call here
        console.log(`Updating delivery ${deliveryId} status to ${newStatus}`);
        // Example API call:
        // updateDeliveryStatus(deliveryId, newStatus);
    };

    const openDetailModal = (delivery: Delivery) => {
        const selectedDeliveryItems = deliveryItems.filter(item => item.delivery_id === delivery.id);
        const selectedDeliveryServices = deliveryServices.filter(service => service.delivery_id === delivery.id);
        setSelectedDelivery(delivery);
        setSelectedDeliveryItem(selectedDeliveryItems || []);
        setSelectedDeliveryService(selectedDeliveryServices || []);
        setIsDetailModalOpen(true);
    };

    const closeAllModals = () => {
        setIsDetailModalOpen(false);
        setSelectedDelivery(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Deliveries" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deliveries</h1>
                    <Link
                        href="/deliveries/add"
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Delivery
                    </Link>
                </div>

                {/* Stats */}
                <DeliveriesStats deliveries={deliveries} />

                {/* Search and Filters */}
                <SearchAndFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    typeFilter={typeFilter}
                    setTypeFilter={setTypeFilter}
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                    statuses={statuses}
                    deliveryTypes={types}
                    dateRanges={dateRanges}
                    resultsCount={filteredDeliveries.length}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                />

                {/* Deliveries List - Add onStatusChange prop */}
                <DeliveriesList
                    deliveries={filteredDeliveries}
                    deliveryItems={deliveryItems}
                    deliveryServices={deliveryServices}
                    onDeliveryClick={openDetailModal}
                    onStatusChange={handleStatusChange}
                    viewMode={viewMode}
                />

                {/* View Detail Modal */}
                {isDetailModalOpen && selectedDelivery && (
                    <DeliveriesDetailModal
                        delivery={selectedDelivery}
                        deliveryItems={selectedDeliveryItem}
                        deliveryServices={selectedDeliveryService}
                        isOpen={isDetailModalOpen}
                        onClose={closeAllModals}
                        onEdit={() => {
                            window.location.href = `/deliveries/${selectedDelivery.id}/edit`;
                        }}
                        onDelete={handleDeleteDelivery}
                        onStatusChange={handleStatusChange}
                    />
                )}
            </div>
        </AppLayout>
    );
}
