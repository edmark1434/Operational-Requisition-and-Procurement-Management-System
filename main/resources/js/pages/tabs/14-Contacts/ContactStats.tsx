interface ContactStatsProps {
    contacts: any[];
}

export default function ContactStats({ contacts }: ContactStatsProps) {
    const totalContacts = contacts.length;
    const activeContacts = contacts.filter(contact => contact.IS_ACTIVE).length;
    const inactiveContacts = contacts.filter(contact => !contact.IS_ACTIVE).length;

    // Count unique vendors
    const uniqueVendors = new Set(contacts.map(contact => contact.VENDOR_NAME)).size;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Contacts */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {totalContacts}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Contacts</div>
            </div>

            {/* Active Contacts */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {activeContacts}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Contacts</div>
            </div>

            {/* Inactive Contacts */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {inactiveContacts}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Inactive Contacts</div>
            </div>

            {/* Unique Vendors */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {uniqueVendors}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Vendor Companies</div>
            </div>
        </div>
    );
}
