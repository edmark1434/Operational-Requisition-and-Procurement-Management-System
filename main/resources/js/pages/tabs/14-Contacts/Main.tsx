import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// Import components
import ContactStats from './ContactStats';
import SearchAndFilters from './SearchAndFilters';
import ContactList from './ContactList';
import ContactDetailModal from './ContactDetailModal';

// Import utilities
import { transformContactsData } from './utils';
import { useContactFilters } from './utils/hooks';
import { toast, Toaster } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Contacts',
        href: '/contacts',
    },
];
interface Prop{
    contactsData: any[],
    success: boolean,
    message: string
}

export default function Contacts({contactsData,success,message}:Prop) {
    const [searchTerm, setSearchTerm] = useState('');
    const [vendorFilter, setVendorFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedContact, setSelectedContact] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [contacts, setContacts] = useState(contactsData);
    const [viewMode, setViewMode] = useState<'comfortable' | 'compact' | 'condensed'>('comfortable');
    const {
        filteredContacts,
        vendors,
        statuses
    } = useContactFilters(contacts, searchTerm, vendorFilter, statusFilter);

    const handleDeleteContact = (id: number) => {
        setContacts(prev => prev.filter(contact => contact.ID !== id));
        setIsDetailModalOpen(false);
    };

    const openDetailModal = (contact: any) => {
        setSelectedContact(contact);
        setIsDetailModalOpen(true);
    };

    const closeAllModals = () => {
        setIsDetailModalOpen(false);
        setSelectedContact(null);
    };
    useEffect(() => {
        if (success) {
            toast(message)
        }     
    },[]);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Contacts" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vendor Contacts</h1>
                    </div>
                    <Link
                        href="/contacts/add"
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Contact
                    </Link>
                </div>

                {/* Stats */}
                <ContactStats contacts={contacts} />

                {/* Search and Filters */}
                <SearchAndFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    vendorFilter={vendorFilter}
                    setVendorFilter={setVendorFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    vendors={vendors}
                    statuses={statuses}
                    resultsCount={filteredContacts.length}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                />

                {/* Contact List */}
                <ContactList
                    contacts={filteredContacts}
                    onContactClick={openDetailModal}
                    viewMode={viewMode}
                />

                {/* View Detail Modal */}
                {isDetailModalOpen && (
                    <ContactDetailModal
                        contact={selectedContact}
                        isOpen={isDetailModalOpen}
                        onClose={closeAllModals}
                        onEdit={() => {
                            window.location.href = `/contacts/${selectedContact.ID}/edit`;
                        }}
                        onDelete={handleDeleteContact}
                    />
                )}
            </div>
        <Toaster/>
        </AppLayout>
    );
}
