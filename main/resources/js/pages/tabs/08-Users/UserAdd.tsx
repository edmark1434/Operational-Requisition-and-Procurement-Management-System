// UserAdd.tsx
import AppLayout from '@/layouts/app-layout';
import { userCreate, users } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Toaster, toast } from 'sonner';

// Import datasets
import roles from '@/pages/datasets/role';
import userRoles from '@/pages/datasets/user_role';
import mockUsers from '@/pages/datasets/user';
import permissions from '@/pages/datasets/permissions';

interface Prop{
    roles: any[],
    permissions: any[],
    role_perm: any[]
}
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: users().url,
    },
    {
        title: 'Add New User',
        href: '/users/add',
    },
];

export default function UserAdd({roles,permissions,role_perm}:Prop) {
    const [formData, setFormData] = useState({
        FIRST_NAME: '',
        MIDDLE_NAME: '',
        LAST_NAME: '',
        SUFFIX: '',
        USERNAME: '',
        PASSWORD: '',
        CONFIRM_PASSWORD: '',
        ROLE_ID: '',
        PERMISSIONS: [] as string[]
    });
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [showPreview, setShowPreview] = useState(false);

    const getPermissionsByRole = (roleId: string) => {
    if (!roleId) return [];
    return role_perm
        .filter(rp => String(rp.ROLE_ID) === String(roleId))
        .map(rp => String(rp.PERM_ID));
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

        if (!formData.PASSWORD) {
            newErrors.PASSWORD = 'Password is required';
        } else if (formData.PASSWORD.length < 8) {
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

        if (MIDDLE_NAME) {
            const middleInitial = MIDDLE_NAME.charAt(0).toUpperCase() + '.';
            fullName += ` ${middleInitial}`;
        }

        if (LAST_NAME) fullName += ` ${LAST_NAME}`;
        if (SUFFIX) fullName += ` ${SUFFIX}`;

        return fullName.trim();
    };

    const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
        if (field === "ROLE_ID") {
            const autoPerms = getPermissionsByRole(value);
            console.log(autoPerms);
            return {
                ...prev,
                ROLE_ID: value,
                PERMISSIONS: autoPerms
            };

        }
        return { ...prev, [field]: value };
    });

    if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
    }
};

    const handlePermissionChange = (permissionId: string, isChecked: boolean) => {
        setFormData(prev => {
            if (isChecked) {
                return {
                    ...prev,
                    PERMISSIONS: [...prev.PERMISSIONS, permissionId]
                };
            } else {
                return {
                    ...prev,
                    PERMISSIONS: prev.PERMISSIONS.filter(id => id !== permissionId)
                };
            }
        });

        if (errors.PERMISSIONS) {
            setErrors(prev => ({ ...prev, PERMISSIONS: '' }));
        }
    };

    const handlePreview = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            setShowPreview(true);
        }
    };

    const handleConfirmSubmit = (e?: React.MouseEvent) => {
    if (e) e.preventDefault(); // prevent default if called from a button

    // Build the payload
    const payload = {
        fullname: getFullName(),
        username: formData.USERNAME,
        password: formData.PASSWORD,
        role_id: formData.ROLE_ID,
        permissions: formData.PERMISSIONS, // array of permission IDs as strings
    };

    router.post(userCreate(), payload, {
        onSuccess: () => {
            toast('User added successfully!');
            setTimeout(() => {
                router.visit(users().url); // redirect to users list
            }, 2000);
        },
        onError: (errors) => {
            const normalizedErrors: { [key: string]: string } = {};
            Object.keys(errors).forEach(key => {
                normalizedErrors[key.toUpperCase()] = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
            });
            setErrors(normalizedErrors);
        },
    });
    setShowPreview(false);
};

    const handleReset = () => {
        setFormData({
            FIRST_NAME: '',
            MIDDLE_NAME: '',
            LAST_NAME: '',
            SUFFIX: '',
            USERNAME: '',
            PASSWORD: '',
            CONFIRM_PASSWORD: '',
            ROLE_ID: '',
            PERMISSIONS: []
        });
        setErrors({});
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.visit(users().url);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add New User" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New User</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Add a new user to the system
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
                                        New User Details
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Fill in the details below to add a new system user
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
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Password <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="password"
                                                        required
                                                        value={formData.PASSWORD}
                                                        onChange={(e) => handleInputChange('PASSWORD', e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                            errors.PASSWORD ? 'border-red-500' : 'border-sidebar-border'
                                                        }`}
                                                        placeholder="Enter password"
                                                    />
                                                    {errors.PASSWORD && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.PASSWORD}</p>
                                                    )}
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        Password must be at least 8 characters long
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Confirm Password <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="password"
                                                        required
                                                        value={formData.CONFIRM_PASSWORD}
                                                        onChange={(e) => handleInputChange('CONFIRM_PASSWORD', e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                            errors.CONFIRM_PASSWORD ? 'border-red-500' : 'border-sidebar-border'
                                                        }`}
                                                        placeholder="Confirm password"
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
                                                            {role.NAME}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.ROLE_ID && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.ROLE_ID}</p>
                                                )}
                                            </div>

                                            {/* Permissions Dropdown */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Permissions
                                                </label>
                                                <div className={`w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-input text-gray-900 dark:text-white ${
                                                    errors.PERMISSIONS ? 'border-red-500' : 'border-sidebar-border'
                                                }`}>
                                                    <div className="max-h-48 overflow-y-auto">
                                                        {permissions.map(permission => (
                                                            <div key={permission.PERMISSION_ID} className="flex items-center py-2">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`permission-${permission.PERMISSION_ID}`}
                                                                    checked={formData.PERMISSIONS.includes(String(permission.PERMISSION_ID))}
                                                                    onChange={(e) => handlePermissionChange(permission.PERMISSION_ID, e.target.checked)}
                                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                                />
                                                                <label
                                                                    htmlFor={`permission-${permission.PERMISSION_ID}`}
                                                                    className="ml-3 text-sm text-gray-700 dark:text-gray-300"
                                                                >
                                                                    {permission.NAME}
                                                                    {permission.DESCRIPTION && (
                                                                        <span className="text-xs text-gray-500 dark:text-gray-400 block">
                                                                            {permission.DESCRIPTION}
                                                                        </span>
                                                                    )}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                {errors.PERMISSIONS && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.PERMISSIONS}</p>
                                                )}
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    Select one or more permissions for this user
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="sticky bottom-0 bg-white dark:bg-background pt-6 pb-2 border-t border-sidebar-border/70 -mx-6 px-6 mt-8">
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={handleReset}
                                                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                            >
                                                Reset Form
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                                            >
                                                Preview User
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <Toaster/>
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
                                    Please review the user details before creating
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
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                Active
                                            </span>
                                        </div>
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

                                {/* Permissions Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Permissions
                                    </h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Selected Permissions
                                        </label>
                                        {formData.PERMISSIONS.length > 0 ? (
                                            <ul className="text-sm text-gray-900 dark:text-white space-y-1">
                                                {formData.PERMISSIONS.map(permissionId => {
                                                    const permission = permissions.find(p => p.PERMISSION_ID === parseInt(permissionId));
                                                    return permission ? (
                                                        <li key={permissionId} className="flex items-center">
                                                            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                            {permission.NAME}
                                                        </li>
                                                    ) : null;
                                                })}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">No permissions selected</p>
                                        )}
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
                                            onClick={handleConfirmSubmit}
                                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                                        >
                                            Confirm & Create User
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
