import { useMemo } from 'react';

export const useContactFilters = (
    contacts: any[],
    searchTerm: string,
    vendorFilter: string,
    statusFilter: string
) => {
    const filteredContacts = useMemo(() => {
        return contacts.filter(contact => {
            const matchesSearch = searchTerm === '' ||
                contact.NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contact.POSITION.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contact.EMAIL.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contact.VENDOR_NAME.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesVendor = vendorFilter === 'All' || contact.VENDOR_NAME === vendorFilter;

            const matchesStatus = statusFilter === 'All' ||
                (statusFilter === 'Active' && contact.IS_ACTIVE) ||
                (statusFilter === 'Inactive' && !contact.IS_ACTIVE);

            return matchesSearch && matchesVendor && matchesStatus;
        });
    }, [contacts, searchTerm, vendorFilter, statusFilter]);

    const vendors = useMemo(() => {
        const uniqueVendors = [...new Set(contacts.map(contact => contact.VENDOR_NAME))];
        return ['All', ...uniqueVendors.sort()];
    }, [contacts]);

    const statuses = useMemo(() => {
        return ['All', 'Active', 'Inactive'];
    }, []);

    return {
        filteredContacts,
        vendors,
        statuses
    };
};
