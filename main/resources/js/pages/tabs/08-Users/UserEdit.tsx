// UserEdit.tsx
import AppLayout from '@/layouts/app-layout';
import { users } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

// Import datasets
import roles from '@/pages/datasets/role';
import userRoles from '@/pages/datasets/user_role';
import mockUsers from '@/pages/datasets/user';

interface UserEditProps {
    auth: any;
    userId: number;
}

const breadcrumbs = (userId: number): BreadcrumbItem[] => [
    {
        title: 'Users',
        href: users().url,
    },
    {
        title: `Edit User #${userId}`,
        href: `/users/${userId}/edit`,
    },
];

export default function UserEdit({ auth, userId }: UserEditProps) {
    const [formData, setFormData] = useState({
        FIRST_NAME: '',
        MIDDLE_NAME: '',
        LAST_NAME: '',
        SUFFIX: '',
        USERNAME: '',
        PASSWORD: '',
        CONFIRM_PASSWORD: '',
        ROLE_ID: '',
        STATUS: 'active' as 'active' | 'inactive'
    });
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showPreview, setShowPreview] = useState(false);

    // Load user data on component mount
    useEffect(() => {
        loadUserData();
    }, [userId]);

// UserEdit.tsx - Update the loadUserData function
    const loadUserData = () => {
        setIsLoading(true);

        try {
            // DEBUG: Log what we're looking for
            console.log('Looking for user with ID:', userId);
            console.log('Available mockUsers:', mockUsers);
            console.log('Available userRoles:', userRoles);

            // Find the user to edit - Use the transformed data structure
            // Since Users.tsx transforms the data, we need to replicate that logic here
            const transformedUsers = mockUsers.map(user => {
                // Find user roles (same logic as Users.tsx)
                const userRoleRelations = userRoles.filter(ur => ur.US_ID === user.US_ID);
                const primaryRole = userRoleRelations.length > 0
                    ? roles.find(role => role.RO_ID === userRoleRelations[0].RO_ID)
                    : null;

                return {
                    id: user.US_ID, // This matches what Users.tsx creates
                    fullname: user.FULLNAME,
                    username: user.NAME,
                    role: primaryRole ? primaryRole.NAME : 'User',
                    role_description: primaryRole ? primaryRole.DESCRIPTION : 'Basic user access',
                    created_at: user.DATE_CREATED,
                    updated_at: user.DATE_UPDATED,
                    status: 'active' as 'active' | 'inactive'
                };
            });

            // Now find the user in the transformed data
            const user = transformedUsers.find(u => u.id === userId);

            if (!user) {
                console.error(`User #${userId} not found in transformed data`);
                console.log('Available transformed users:', transformedUsers.map(u => ({ id: u.id, username: u.username })));
                alert('User not found!');
                router.visit(users().url);
                return;
            }

            // Now we have the user data, but we need the original user data for form filling
            const originalUser = mockUsers.find(u => u.US_ID === userId);

            if (!originalUser) {
                console.error(`Original user data not found for ID: ${userId}`);
                alert('User data error!');
                router.visit(users().url);
                return;
            }

            // Find user's role from original data
            const userRole = userRoles.find(ur => ur.US_ID === userId);

            // Parse full name into components
            const nameParts = originalUser.FULLNAME.split(' ').filter(part => part.trim() !== '');

            let firstName = nameParts[0] || '';
            let lastName = nameParts[nameParts.length - 1] || '';
            let middleName = '';
            let suffix = '';

            // Handle middle names and suffix
            if (nameParts.length > 2) {
                const middleParts = nameParts.slice(1, -1);
                const suffixes = ['Jr.', 'Sr.', 'II', 'III', 'IV', 'Jr', 'Sr'];

                // Check if last middle part is a suffix
                const lastMiddlePart = middleParts[middleParts.length - 1];
                if (suffixes.includes(lastMiddlePart)) {
                    suffix = lastMiddlePart;
                    middleName = middleParts.slice(0, -1).join(' ');
                } else {
                    middleName = middleParts.join(' ');
                }
            }

            setFormData({
                FIRST_NAME: firstName,
                MIDDLE_NAME: middleName,
                LAST_NAME: lastName,
                SUFFIX: suffix,
                USERNAME: originalUser.NAME || '',
                PASSWORD: '', // Don't load existing password
                CONFIRM_PASSWORD: '',
                ROLE_ID: userRole?.RO_ID.toString() || '',
                STATUS: 'active'
            });

            console.log('Successfully loaded user data for editing:', {
                userId,
                username: user.username,
                fullname: user.fullname
            });

        } catch (error) {
            console.error('Error loading user data:', error);
            alert('Error loading user data!');
            router.visit(users().url);
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};

        if (!formData.FIRST_NAME.trim()) {
            newErrors.FIRST_NAME = 'First name is required';
        }

        if (!formData.LAST_NAME.trim()) {
            newErrors.LAST_NAME = 'Last name is required';
        }

        if (!formData.USERNAME.trim()) {
            newErrors.USERNAME = 'Username is required';
        } else if (formData.USERNAME.length < 3) {
            newErrors.USERNAME = 'Username must be at least 3 characters';
        }

        // Only validate password if it's being changed
        if (formData.PASSWORD && formData.PASSWORD.length < 8) {
            newErrors.PASSWORD = 'Password must be at least 8 characters';
        }

        if (formData.PASSWORD !== formData.CONFIRM_PASSWORD) {
            newErrors.CONFIRM_PASSWORD = 'Passwords do not match';
        }

        if (!formData.ROLE_ID) {
            newErrors.ROLE_ID = 'Role is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getFullName = () => {
        const { FIRST_NAME, MIDDLE_NAME, LAST_NAME, SUFFIX } = formData;
        let fullName = FIRST_NAME;

        // Convert middle name to middle initial (first letter only)
        if (MIDDLE_NAME) {
            const middleInitial = MIDDLE_NAME.charAt(0).toUpperCase() + '.';
            fullName += ` ${middleInitial}`;
        }

        if (LAST_NAME) fullName += ` ${LAST_NAME}`;
        if (SUFFIX) fullName += ` ${SUFFIX}`;

        return fullName.trim();
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

    const handlePreview = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            setShowPreview(true);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            // Prepare updated user data
            const updatedUserData = {
                FULLNAME: getFullName(),
                NAME: formData.USERNAME,
                PASSWORD: formData.PASSWORD || undefined, // Only update if changed
                DATE_UPDATED: new Date().toISOString().replace('T', ' ').substring(0, 19),
                STATUS: formData.STATUS
            };

            // Prepare user role data
            const userRoleData = {
                RO_ID: parseInt(formData.ROLE_ID)
            };

            console.log('Updated User Data:', updatedUserData);
            console.log('Updated User Role Data:', userRoleData);

            // In real application, you would send PATCH request to backend
            alert('User updated successfully!');

            // Redirect back to users list
            router.visit(users().url);
        }
    };

    const handleDelete = () => {
        console.log('Deleting user:', userId);

        // In real application, you would send DELETE request to backend
        alert('User deleted successfully!');
        setShowDeleteConfirm(false);

        // Redirect back to users list
        router.visit(users().url);
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.visit(users().url);
        }
    };

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs(userId)}>
                <Head title="Edit User" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Edit User</h1>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading user data...</p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs(userId)}>
                <Head title="Edit User" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit User</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Editing User #{userId}
                            </p>
                        </div>
                        <Link
                            href={users().url}
                            className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                        >
                            Return to Users
                        </Link>
                    </div>

                    {/* Form Container */}
                    <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-[oklch(0.145_0_0)]">
                        <div className="h-full overflow-y-auto">
                            <div className="min-h-full flex items-start justify-center p-6">
                                <div className="w-full max-w-4xl bg-white dark:bg-background rounded-xl border border-sidebar-border/70 shadow-lg">
                                    {/* Header Section */}
                                    <div className="border-b border-sidebar-border/70 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            Edit User #{userId}
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Update the user details below
                                        </p>
                                    </div>

                                    <form onSubmit={handlePreview} className="p-6">
                                        <div className="space-y-8">
                                            {/* Name Information */}
                                            <div className="space-y-6">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-3">
                                                    Name Information
                                                </h3>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            First Name <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={formData.FIRST_NAME}
                                                            onChange={(e) => handleInputChange('FIRST_NAME', e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                                errors.FIRST_NAME ? 'border-red-500' : 'border-sidebar-border'
                                                            }`}
                                                            placeholder="Enter first name"
                                                        />
                                                        {errors.FIRST_NAME && (
                                                            <p className="text-red-500 text-xs mt-1">{errors.FIRST_NAME}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Middle Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.MIDDLE_NAME}
                                                            onChange={(e) => handleInputChange('MIDDLE_NAME', e.target.value)}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                            placeholder="Enter middle name (optional)"
                                                        />
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            Will be displayed as initial in full name
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Last Name <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={formData.LAST_NAME}
                                                            onChange={(e) => handleInputChange('LAST_NAME', e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                                errors.LAST_NAME ? 'border-red-500' : 'border-sidebar-border'
                                                            }`}
                                                            placeholder="Enter last name"
                                                        />
                                                        {errors.LAST_NAME && (
                                                            <p className="text-red-500 text-xs mt-1">{errors.LAST_NAME}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Suffix
                                                        </label>
                                                        <select
                                                            value={formData.SUFFIX}
                                                            onChange={(e) => handleInputChange('SUFFIX', e.target.value)}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                        >
                                                            <option value="">Select suffix (optional)</option>
                                                            <option value="Jr.">Jr.</option>
                                                            <option value="Sr.">Sr.</option>
                                                            <option value="II">II</option>
                                                            <option value="III">III</option>
                                                            <option value="IV">IV</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Name Preview */}
                                                {getFullName() && (
                                                    <div className="p-4 bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border">
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Full Name Preview
                                                        </label>
                                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                            {getFullName()}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            Middle name will be displayed as initial only
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Account Information */}
                                            <div className="space-y-6">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-3">
                                                    Account Information
                                                </h3>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Username <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={formData.USERNAME}
                                                            onChange={(e) => handleInputChange('USERNAME', e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                                errors.USERNAME ? 'border-red-500' : 'border-sidebar-border'
                                                            }`}
                                                            placeholder="Enter username"
                                                        />
                                                        {errors.USERNAME && (
                                                            <p className="text-red-500 text-xs mt-1">{errors.USERNAME}</p>
                                                        )}
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            Enter a unique username for login
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Status
                                                        </label>
                                                        <select
                                                            value={formData.STATUS}
                                                            onChange={(e) => handleInputChange('STATUS', e.target.value)}
                                                            className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                                        >
                                                            <option value="active">Active</option>
                                                            <option value="inactive">Inactive</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            New Password
                                                        </label>
                                                        <input
                                                            type="password"
                                                            value={formData.PASSWORD}
                                                            onChange={(e) => handleInputChange('PASSWORD', e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                                errors.PASSWORD ? 'border-red-500' : 'border-sidebar-border'
                                                            }`}
                                                            placeholder="Leave blank to keep current password"
                                                        />
                                                        {errors.PASSWORD && (
                                                            <p className="text-red-500 text-xs mt-1">{errors.PASSWORD}</p>
                                                        )}
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            Leave blank to keep current password
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Confirm Password
                                                        </label>
                                                        <input
                                                            type="password"
                                                            value={formData.CONFIRM_PASSWORD}
                                                            onChange={(e) => handleInputChange('CONFIRM_PASSWORD', e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                                errors.CONFIRM_PASSWORD ? 'border-red-500' : 'border-sidebar-border'
                                                            }`}
                                                            placeholder="Confirm new password"
                                                        />
                                                        {errors.CONFIRM_PASSWORD && (
                                                            <p className="text-red-500 text-xs mt-1">{errors.CONFIRM_PASSWORD}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Role Information */}
                                            <div className="space-y-6">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-sidebar-border/70 pb-3">
                                                    Role Information
                                                </h3>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        User Role <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        required
                                                        value={formData.ROLE_ID}
                                                        onChange={(e) => handleInputChange('ROLE_ID', e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                            errors.ROLE_ID ? 'border-red-500' : 'border-sidebar-border'
                                                        }`}
                                                    >
                                                        <option value="">Select a role</option>
                                                        {roles.map(role => (
                                                            <option key={role.RO_ID} value={role.RO_ID}>
                                                                {role.NAME} - {role.DESCRIPTION}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors.ROLE_ID && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.ROLE_ID}</p>
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
                                                    Delete User
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
                                                        Preview Changes
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
                                Delete User
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Are you sure you want to delete "{getFullName()}"? This action cannot be undone.
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
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-sidebar rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-sidebar-border">
                        {/* Header */}
                        <div className="p-6 border-b border-sidebar-border bg-white dark:bg-sidebar">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    User Preview
                                </h2>
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                Please review the user details before updating
                            </p>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6 bg-white dark:bg-sidebar">
                            {/* Name Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Name Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            First Name
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white">{formData.FIRST_NAME}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Middle Name
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white">{formData.MIDDLE_NAME || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Last Name
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white">{formData.LAST_NAME}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Suffix
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white">{formData.SUFFIX || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                                        Full Name (Display)
                                    </label>
                                    <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{getFullName()}</p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                        Middle name displayed as initial only
                                    </p>
                                </div>
                            </div>

                            {/* Account Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Account Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Username
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white font-mono">{formData.USERNAME}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Status
                                        </label>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            formData.STATUS === 'active'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}>
                                            {formData.STATUS === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Password
                                    </label>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {formData.PASSWORD ? 'Password will be updated' : 'Current password will be kept'}
                                    </p>
                                </div>
                            </div>

                            {/* Role Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Role Information
                                </h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Assigned Role
                                    </label>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {roles.find(role => role.RO_ID === parseInt(formData.ROLE_ID))?.NAME}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {roles.find(role => role.RO_ID === parseInt(formData.ROLE_ID))?.DESCRIPTION}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer with Actions */}
                        <div className="p-6 border-t border-sidebar-border bg-gray-50 dark:bg-sidebar-accent">
                            <div className="flex justify-between items-center">
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-sidebar border border-sidebar-border rounded-lg hover:bg-gray-50 dark:hover:bg-sidebar-accent"
                                >
                                    Back to Edit
                                </button>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSubmit}
                                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                                    >
                                        Confirm & Update User
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
