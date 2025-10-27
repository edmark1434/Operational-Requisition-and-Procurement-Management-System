// components/user-modal.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface User {
    id: number;
    fullname: string;
    username: string;
    role: string;
    role_description: string;
    created_at: string;
    updated_at: string;
    status: 'active' | 'inactive';
}

interface Role {
    id: number;
    name: string;
    description: string;
}

interface UserModalProps {
    mode: 'add' | 'edit';
    user: User | null;
    roles: Role[];
    onSave: (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => void;
    onClose: () => void;
}

interface FormData {
    fullname: string;
    username: string;
    role: string;
    password: string;
    password_confirmation: string;
    status: 'active' | 'inactive';
}

export default function UserModal({ mode, user, roles, onSave, onClose }: UserModalProps) {
    const [formData, setFormData] = useState<FormData>({
        fullname: '',
        username: '',
        role: '',
        password: '',
        password_confirmation: '',
        status: 'active'
    });
    const [errors, setErrors] = useState<{[key: string]: string}>({});

    useEffect(() => {
        if (mode === 'edit' && user) {
            setFormData({
                fullname: user.fullname,
                username: user.username,
                role: user.role,
                password: '',
                password_confirmation: '',
                status: user.status
            });
        } else {
            setFormData({
                fullname: '',
                username: '',
                role: '',
                password: '',
                password_confirmation: '',
                status: 'active'
            });
        }
        setErrors({});
    }, [mode, user]);

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};

        if (!formData.fullname.trim()) {
            newErrors.fullname = 'Full name is required';
        }

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        }

        if (!formData.role) {
            newErrors.role = 'Role is required';
        }

        if (mode === 'add' && !formData.password) {
            newErrors.password = 'Password is required';
        }

        if (mode === 'add' && formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = 'Passwords do not match';
        }

        if (mode === 'add' && formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSave({
                fullname: formData.fullname,
                username: formData.username,
                role: formData.role,
                role_description: roles.find(r => r.name === formData.role)?.description || '',
                status: formData.status
            });
        }
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-sidebar rounded-xl max-w-md w-full border border-sidebar-border max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-sidebar-border">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {mode === 'add' ? 'Add New User' : 'Edit User'}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {mode === 'add'
                            ? 'Create a new user account'
                            : `Edit ${user?.fullname}'s details`
                        }
                    </p>
                </div>

                <div className="p-6 space-y-4">
                    {/* Full Name */}
                    <div>
                        <Label htmlFor="fullname" className="text-sm font-medium mb-2 block">
                            Full Name *
                        </Label>
                        <Input
                            id="fullname"
                            type="text"
                            required
                            value={formData.fullname}
                            onChange={(e) => handleInputChange('fullname', e.target.value)}
                            className={errors.fullname ? 'border-red-500' : ''}
                            placeholder="Enter full name"
                        />
                        {errors.fullname && (
                            <p className="text-red-500 text-xs mt-1">{errors.fullname}</p>
                        )}
                    </div>

                    {/* Username */}
                    <div>
                        <Label htmlFor="username" className="text-sm font-medium mb-2 block">
                            Username *
                        </Label>
                        <Input
                            id="username"
                            type="text"
                            required
                            value={formData.username}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                            className={errors.username ? 'border-red-500' : ''}
                            placeholder="Enter username"
                        />
                        {errors.username && (
                            <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                        )}
                    </div>

                    {/* Role */}
                    <div>
                        <Label htmlFor="role" className="text-sm font-medium mb-2 block">
                            Role *
                        </Label>
                        <select
                            id="role"
                            required
                            value={formData.role}
                            onChange={(e) => handleInputChange('role', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                errors.role ? 'border-red-500' : 'border-sidebar-border'
                            }`}
                        >
                            <option value="">Select a role</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.name}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                        {errors.role && (
                            <p className="text-red-500 text-xs mt-1">{errors.role}</p>
                        )}
                    </div>

                    {/* Status (only for edit) */}
                    {mode === 'edit' && (
                        <div>
                            <Label htmlFor="status" className="text-sm font-medium mb-2 block">
                                Status
                            </Label>
                            <select
                                id="status"
                                value={formData.status}
                                onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive')}
                                className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    )}

                    {/* Password (only for new users) */}
                    {mode === 'add' && (
                        <>
                            <div>
                                <Label htmlFor="password" className="text-sm font-medium mb-2 block">
                                    Password *
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    className={errors.password ? 'border-red-500' : ''}
                                    placeholder="Enter password"
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="password_confirmation" className="text-sm font-medium mb-2 block">
                                    Confirm Password *
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    value={formData.password_confirmation}
                                    onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
                                    className={errors.password_confirmation ? 'border-red-500' : ''}
                                    placeholder="Confirm password"
                                />
                                {errors.password_confirmation && (
                                    <p className="text-red-500 text-xs mt-1">{errors.password_confirmation}</p>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="p-6 border-t border-sidebar-border flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {mode === 'add' ? 'Add User' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
