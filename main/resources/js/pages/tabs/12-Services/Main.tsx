import {Head, Link, router, usePage} from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// Import components
import ServiceStats from './ServiceStats';
import SearchAndFilters from './SearchAndFilters';
import ServiceList from './ServiceList';
import ServiceDetailModal from './ServiceDetailModal';

// Import utilities
import { useServiceFilters } from './utils/hooks';
import {servicedelete} from "@/routes";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Services',
        href: '/services',
    },
];

type Service = {
    id: number;
    name: string;
    description: string;
    hourly_rate: number;
    is_active: boolean;
    category_id: number;
    vendor_id: number | null;
    category: string;
    vendor: string | null;
    vendor_contact_num: string | null;
    vendor_email: string | null;
};

type Category = {
    id: number;
    name: string;
    description: string;
    type: 'Items' | 'Services';
    is_active: boolean;
};

export default function Services() {
    const { services: backendServices, categories } = usePage<{
        services: Service[];
        categories: Category[];
    }>().props;
    const [services, setServices] = useState<Service[]>(backendServices);

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [selectedService, setSelectedService] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'comfortable' | 'compact' | 'condensed'>('comfortable');

    const {filteredServices} = useServiceFilters(services, searchTerm, categoryFilter);

    const handleDeleteService = (id: number) => {
        router.delete(servicedelete(id).url);
        alert('Service deleted successfully!');
        setIsDetailModalOpen(false);
        setServices(prev => prev.filter(s => s.id !== id));
    };

    const openDetailModal = (service: any) => {
        setSelectedService(service);
        setIsDetailModalOpen(true);
    };

    const closeAllModals = () => {
        setIsDetailModalOpen(false);
        setSelectedService(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Services" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Services</h1>
                    <Link
                        href="/services/add"
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Service
                    </Link>
                </div>

                {/* Stats */}
                <ServiceStats services={services} />

                {/* Search and Filters */}
                <SearchAndFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    categories={categories.map(c => c.name)}
                    resultsCount={filteredServices.length}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                />

                {/* Service List */}
                <ServiceList
                    services={filteredServices}
                    onServiceClick={openDetailModal}
                    viewMode={viewMode}
                />

                {/* View Detail Modal */}
                {isDetailModalOpen && (
                    <ServiceDetailModal
                        service={selectedService}
                        isOpen={isDetailModalOpen}
                        onClose={closeAllModals}
                        onEdit={() => {
                            // Redirect to edit page
                            window.location.href = `/services/${selectedService.id}/edit`;
                        }}
                        onDelete={handleDeleteService}
                    />
                )}
            </div>
        </AppLayout>
    );
}
