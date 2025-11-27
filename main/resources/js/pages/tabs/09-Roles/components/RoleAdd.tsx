import AppLayout from '@/layouts/app-layout';
import { roles } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles & Permissions',
        href: roles().url,
    },
    {
        title: 'Add New Role',
        href: '/roles-permissions/role/add',
    },
];

export default function RoleAdd({ auth }: { auth: any }) {
    const [formData, setFormData] = useState({
        NAME: '',
        DESCRIPTION: '',
        IS_ACTIVE: true
    });
    const [errors, setErrors] = useState<{[key: string]: string}>({});

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};

        if (!formData.NAME.trim()) {
            newErrors.NAME = 'Role name is required';
        }

        if (!formData.DESCRIPTION.trim()) {
            newErrors.DESCRIPTION = 'Description is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            // Generate new role ID
            const newRoleId = Math.floor(Math.random() * 1000) + 8000;

            // Prepare role data
            const roleDataToAdd = {
                ID: newRoleId,
                ...formData,
                PERMISSION_COUNT: 0,
                CREATED_AT: new Date().toISOString(),
                UPDATED_AT: new Date().toISOString()
            };

            console.log('New Role Data:', roleDataToAdd);

            // In real application, you would send POST request to backend
            alert('Role added successfully!');

            // Redirect back to roles & permissions
            router.visit(roles().url);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleReset = () => {
        setFormData({
            NAME: '',
            DESCRIPTION: '',
            IS_ACTIVE: true
        });
        setErrors({});
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.visit(roles().url);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add New Role" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Role</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Add a new role to your system
                        </p>
                    </div>
                    <Link
                        href={roles().url}
                        className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                    >
                        Return to Roles & Permissions
                    </Link>
                </div>

                {/* Form Container */}
                <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-[oklch(0.145_0_0)]">
                    <div className="h-full overflow-y-auto">
                        <div className="min-h-full flex items-start justify-center p-6">
                            <div className="w-full max-w-2xl bg-white dark:bg-background rounded-xl border border-sidebar-border/70 shadow-lg">
                                {/* Header Section */}
                                <div className="border-b border-sidebar-border/70 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        New Role Details
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Fill in the details below to add a new role
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6">
                                    <div className="space-y-6">
                                        {/* Basic Information */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-3">
                                                Role Information
                                            </h3>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Role Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.NAME}
                                                    onChange={(e) => handleInputChange('NAME', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                        errors.NAME ? 'border-red-500' : 'border-sidebar-border'
                                                    }`}
                                                    placeholder="Enter role name"
                                                />
                                                {errors.NAME && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.NAME}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Description <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    required
                                                    value={formData.DESCRIPTION}
                                                    onChange={(e) => handleInputChange('DESCRIPTION', e.target.value)}
                                                    rows={3}
                                                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                        errors.DESCRIPTION ? 'border-red-500' : 'border-sidebar-border'
                                                    }`}
                                                    placeholder="Describe the role..."
                                                />
                                                {errors.DESCRIPTION && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.DESCRIPTION}</p>
                                                )}
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
                                                    Active Role
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="sticky bottom-0 bg-white dark:bg-background pt-6 pb-2 border-t border-sidebar-border/70 -mx-6 px-6 mt-8">
                                        <div className="flex gap-3 justify-between">
                                            <div className="flex gap-3">
                                                {/* Reset Button */}
                                                <div className="relative group">
                                                    <button
                                                        type="button"
                                                        onClick={handleReset}
                                                        className="w-12 h-12 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                        </svg>
                                                    </button>
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                                        Reset Form
                                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                                    </div>
                                                </div>

                                                {/* Cancel Button */}
                                                <div className="relative group">
                                                    <button
                                                        type="button"
                                                        onClick={handleCancel}
                                                        className="w-12 h-12 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                                        Cancel
                                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Add Role Button */}
                                            <button
                                                type="submit"
                                                className="flex-1 max-w-xs bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                            >
                                                Add Role
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
