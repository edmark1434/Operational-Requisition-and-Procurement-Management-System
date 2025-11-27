import AppLayout from '@/layouts/app-layout';
import { contacts } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import SUPPLIER_OPTIONS from '@/pages/datasets/supplier';
import contactData from "@/pages/datasets/contact";

interface ContactEditProps {
    auth: any;
    contactId: number;
}

const breadcrumbs = (contactId: number): BreadcrumbItem[] => [
    {
        title: 'Contacts',
        href: contacts().url,
    },
    {
        title: `Edit Contact #${contactId}`,
        href: `/contacts/${contactId}/edit`,
    },
];

export default function ContactEdit({ auth, contactId }: ContactEditProps) {
    const [formData, setFormData] = useState({
        NAME: '',
        POSITION: '',
        EMAIL: '',
        CONTACT_NUMBER: '',
        VENDOR_ID: '',
        VENDOR_NAME: '',
        VENDOR_EMAIL: '',
        IS_ACTIVE: true
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load contact data on component mount
    useEffect(() => {
        loadContactData();
    }, [contactId]);

    const loadContactData = () => {
        setIsLoading(true);

        try {
            // Find the contact to edit
            const contact = contactData.find(contact => contact.ID === contactId);

            if (!contact) {
                console.error(`Contact #${contactId} not found`);
                alert('Contact not found!');
                router.visit(contacts().url);
                return;
            }

            // Transform contact data to match form structure
            const vendor = SUPPLIER_OPTIONS.find(sup => sup.ID === contact.VENDOR_ID);

            setFormData({
                NAME: contact.NAME || '',
                POSITION: contact.POSITION || '',
                EMAIL: contact.EMAIL || '',
                CONTACT_NUMBER: contact.CONTACT_NUMBER || '',
                VENDOR_ID: contact.VENDOR_ID?.toString() || '',
                VENDOR_NAME: vendor?.NAME || '',
                VENDOR_EMAIL: vendor?.EMAIL || '',
                IS_ACTIVE: contact.IS_ACTIVE || true
            });
        } catch (error) {
            console.error('Error loading contact data:', error);
            alert('Error loading contact data!');
            router.visit(contacts().url);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVendorChange = (vendorId: string) => {
        const selectedVendor = SUPPLIER_OPTIONS.find(s => s.ID.toString() === vendorId);
        if (selectedVendor) {
            setFormData(prev => ({
                ...prev,
                VENDOR_ID: vendorId,
                VENDOR_NAME: selectedVendor.NAME,
                VENDOR_EMAIL: selectedVendor.EMAIL
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare updated contact data
        const updatedContactData = {
            ...formData,
            VENDOR_ID: parseInt(formData.VENDOR_ID),
            CONTACT_INFO: `${formData.EMAIL} | ${formData.CONTACT_NUMBER}`,
            UPDATED_AT: new Date().toISOString()
        };

        console.log('Updated Contact Data:', updatedContactData);

        // In real application, you would send PATCH request to backend
        alert('Contact updated successfully!');

        // Redirect back to contacts list
        router.visit(contacts().url);
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDelete = () => {
        console.log('Deleting contact:', contactId);

        // In real application, you would send DELETE request to backend
        alert('Contact deleted successfully!');
        setShowDeleteConfirm(false);

        // Redirect back to contacts list
        router.visit(contacts().url);
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.visit(contacts().url);
        }
    };

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs(contactId)}>
                <Head title="Edit Contact" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Edit Contact</h1>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading contact data...</p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs(contactId)}>
                <Head title="Edit Contact" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Edit Contact</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Editing Contact #{contactId}
                            </p>
                        </div>
                        <Link
                            href={contacts().url}
                            className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                        >
                            Return to Contacts
                        </Link>
                    </div>

                    {/* Form Container */}
                    <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-white dark:bg-sidebar">
                        <div className="h-full overflow-y-auto">
                            <div className="min-h-full flex items-start justify-center p-6">
                                <div className="w-full max-w-4xl bg-white dark:bg-background rounded-xl border border-sidebar-border/70 shadow-lg">
                                    {/* Header Section */}
                                    <div className="border-b border-sidebar-border/70 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            Edit Contact #{contactId}
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Update the contact details below
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="p-6">
                                        <div className="space-y-6">
                                            {/* Contact Information */}
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    Contact Information
                                                </h3>

                                                <div className="grid grid-cols-1 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Full Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={formData.NAME}
                                                            onChange={(e) => handleInputChange('NAME', e.target.value)}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                            placeholder="Enter full name"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Position *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={formData.POSITION}
                                                            onChange={(e) => handleInputChange('POSITION', e.target.value)}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                            placeholder="Enter position/title"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Email *
                                                        </label>
                                                        <input
                                                            type="email"
                                                            required
                                                            value={formData.EMAIL}
                                                            onChange={(e) => handleInputChange('EMAIL', e.target.value)}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                            placeholder="email@company.com"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Contact Number *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={formData.CONTACT_NUMBER}
                                                            onChange={(e) => handleInputChange('CONTACT_NUMBER', e.target.value)}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                            placeholder="(555) 123-4567"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="is_active"
                                                        checked={formData.IS_ACTIVE}
                                                        onChange={(e) => handleInputChange('IS_ACTIVE', e.target.checked)}
                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                    />
                                                    <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                        Active Contact
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Vendor Information */}
                                            <div className="border-t border-sidebar-border pt-6">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                    Vendor Information
                                                </h3>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Vendor Company *
                                                        </label>
                                                        <select
                                                            required
                                                            value={formData.VENDOR_ID}
                                                            onChange={(e) => handleVendorChange(e.target.value)}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                        >
                                                            <option value="">Select a vendor</option>
                                                            {SUPPLIER_OPTIONS.map(vendor => (
                                                                <option key={vendor.ID} value={vendor.ID}>
                                                                    {vendor.NAME}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Display selected vendor info */}
                                                    {formData.VENDOR_ID && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                    Company Email
                                                                </label>
                                                                <p className="text-sm text-gray-900 dark:text-white">
                                                                    {formData.VENDOR_EMAIL}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                    Company Contact
                                                                </label>
                                                                <p className="text-sm text-gray-900 dark:text-white">
                                                                    {SUPPLIER_OPTIONS.find(v => v.ID.toString() === formData.VENDOR_ID)?.CONTACT_NUMBER}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="sticky bottom-0 bg-white dark:bg-background pt-6 pb-2 border-t border-sidebar-border/70 -mx-6 px-6 mt-8">
                                            <div className="flex justify-between items-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowDeleteConfirm(true)}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete Contact
                                                </button>
                                                <div className="flex gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={handleCancel}
                                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                                    >
                                                        Save Changes
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-sidebar rounded-xl max-w-md w-full border border-sidebar-border">
                        <div className="p-6 border-b border-sidebar-border">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Delete Contact
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Are you sure you want to delete "{formData.NAME}"? This action cannot be undone.
                            </p>
                        </div>
                        <div className="p-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                            >
                                Delete Contact
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
