import { Link } from '@inertiajs/react';
import { ContactStatusIcons } from './utils/icons';
import { getContactStatusColor, getVendorColor } from './utils/styleUtils';
import { formatPhoneNumber, formatDate } from './utils/formatters';
import { LoaderCircle, Users, Edit, Phone, Mail } from 'lucide-react';

interface ContactListProps {
    contacts: any[];
    onContactClick: (contact: any, editing?: boolean) => void;
    viewMode: 'comfortable' | 'compact' | 'condensed';
    isLoading?: boolean;
}

export default function ContactList({ contacts, onContactClick, viewMode, isLoading = false }: ContactListProps) {
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-8">
                <div className="flex items-center justify-center">
                    <LoaderCircle className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">Loading contacts...</span>
                </div>
            </div>
        );
    }

    if (contacts.length === 0) {
        return (
            <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border bg-sidebar dark:bg-sidebar">
                <div className="h-full overflow-y-auto">
                    <div className="p-4 text-center py-12">
                        <div className="text-gray-400 dark:text-gray-600 mb-4">
                            <Users className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No contacts found</h3>
                        <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (viewMode === 'condensed') {
        return (
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-sidebar border-b border-sidebar-border text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="col-span-3">Contact</div>
                    <div className="col-span-2">Position</div>
                    <div className="col-span-2">Vendor</div>
                    <div className="col-span-2">Contact Info</div>
                    <div className="col-span-1 text-center">Status</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-sidebar-border">
                    {contacts.map((contact) => {
                        const status = contact.IS_ACTIVE ? 'active' : 'inactive';
                        const statusText = contact.IS_ACTIVE ? 'Active' : 'Inactive';

                        return (
                            <div
                                key={contact.ID}
                                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-sidebar transition-colors cursor-pointer"
                                onClick={() => onContactClick(contact)}
                            >
                                {/* Contact Info */}
                                <div className="col-span-3 flex items-center space-x-3">
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {contact.NAME}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            #{contact.ID}
                                        </div>
                                    </div>
                                </div>

                                {/* Position */}
                                <div className="col-span-2 flex items-center">
                                    <span className="text-sm text-gray-900 dark:text-white truncate">
                                        {contact.POSITION}
                                    </span>
                                </div>

                                {/* Vendor */}
                                <div className="col-span-2 flex items-center">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getVendorColor(contact.VENDOR_NAME)}`}>
                                        {contact.VENDOR_NAME}
                                    </span>
                                </div>

                                {/* Contact Info */}
                                <div className="col-span-2 flex items-center">
                                    <div className="min-w-0">
                                        <div className="text-sm text-gray-900 dark:text-white truncate">
                                            {contact.EMAIL}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {formatPhoneNumber(contact.CONTACT_NUMBER)}
                                        </div>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="col-span-1 flex items-center justify-center">
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getContactStatusColor(status)}`}>
                                        {ContactStatusIcons[status as keyof typeof ContactStatusIcons]}
                                        {statusText}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="col-span-2 flex items-center justify-end space-x-2">
                                    <Link
                                        href={`/contacts/${contact.ID}/edit`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 rounded"
                                        title="Edit Contact"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border bg-sidebar dark:bg-sidebar">
            <div className="h-full overflow-y-auto p-4">
                <div className={`grid gap-4 ${
                    viewMode === 'comfortable'
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6'
                }`}>
                    {contacts.map((contact) => (
                        <ContactCard
                            key={contact.ID}
                            contact={contact}
                            onClick={() => onContactClick(contact)}
                            viewMode={viewMode}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Contact Card Component for Comfortable and Compact views
function ContactCard({ contact, onClick, viewMode }: {
    contact: any;
    onClick: () => void;
    viewMode: 'comfortable' | 'compact';
}) {
    const status = contact.IS_ACTIVE ? 'active' : 'inactive';
    const statusText = contact.IS_ACTIVE ? 'Active' : 'Inactive';

    if (viewMode === 'compact') {
        return (
            <div className="border border-sidebar-border rounded-lg bg-white dark:bg-sidebar-accent p-3 hover:shadow-md transition-all duration-200 cursor-pointer group">
                {/* Compact Header */}
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        #{contact.ID}
                    </span>
                    <Link
                        href={`/contacts/${contact.ID}/edit`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1"
                    >
                        <Edit className="w-3 h-3" />
                    </Link>
                </div>

                {/* Contact Name - Compact */}
                <h3
                    className="font-medium text-sm text-gray-900 dark:text-white mb-1 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={onClick}
                >
                    {contact.NAME}
                </h3>

                {/* Position - Compact */}
                <div className="mb-2">
                    <span className="inline-block px-1.5 py-0.5 rounded text-xs bg-gray-100 dark:bg-sidebar text-gray-600 dark:text-gray-400">
                        {contact.POSITION}
                    </span>
                </div>

                {/* Vendor and Status - Compact */}
                <div className="space-y-1">
                    <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${getContactStatusColor(status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {statusText}
                    </div>

                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Vendor:</span>
                        <span className="font-semibold text-gray-900 dark:text-white truncate ml-1">
                            {contact.VENDOR_NAME}
                        </span>
                    </div>

                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Email:</span>
                        <span className="text-blue-600 dark:text-blue-400 truncate ml-1">
                            {contact.EMAIL}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // Comfortable View
    return (
        <div className="border border-sidebar-border rounded-lg bg-white dark:bg-sidebar-accent p-4 hover:shadow-md transition-all duration-200 cursor-pointer group">
            {/* Header with ID and Actions */}
            <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-sidebar px-2 py-1 rounded">
                    #{contact.ID}
                </span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Link
                        href={`/contacts/${contact.ID}/edit`}
                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded"
                    >
                        <Edit className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Contact Name */}
            <h3
                className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400"
                onClick={onClick}
            >
                {contact.NAME}
            </h3>

            {/* Position */}
            <div className="mb-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {contact.POSITION}
                </span>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
                {/* Status */}
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getContactStatusColor(status)}`}>
                    {ContactStatusIcons[status as keyof typeof ContactStatusIcons]}
                    {statusText}
                </div>

                {/* Vendor */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Vendor:</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {contact.VENDOR_NAME}
                    </span>
                </div>

                {/* Email */}
                <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-blue-600 dark:text-blue-400 truncate">
                        {contact.EMAIL}
                    </span>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white">
                        {formatPhoneNumber(contact.CONTACT_NUMBER)}
                    </span>
                </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-4 pt-3 border-t border-sidebar-border flex justify-between items-center">
                <button
                    onClick={onClick}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                    View Details
                </button>

                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Users className="w-3 h-3" />
                    Vendor Contact
                </div>
            </div>
        </div>
    );
}
