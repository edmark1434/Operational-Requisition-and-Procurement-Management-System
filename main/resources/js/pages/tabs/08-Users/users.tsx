// Users.tsx
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { LoaderCircle, Search, Plus, Edit, Trash2, Shield } from 'lucide-react';
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    },
];

// Mock data - replace with actual API calls
const mockUsers: User[] = [
    {
        id: 1,
        fullname: 'John Doe',
        username: 'johndoe',
        role: 'Admin',
        role_description: 'Full system access',
        created_at: '2024-01-15',
        updated_at: '2024-03-20',
        status: 'active'
    },
    {
        id: 2,
        fullname: 'Jane Smith',
        username: 'janesmith',
        role: 'Manager',
        role_description: 'Inventory and requisition management',
        created_at: '2024-01-20',
        updated_at: '2024-03-18',
        status: 'active'
    },
    {
        id: 3,
        fullname: 'Bob Wilson',
        username: 'bobwilson',
        role: 'Staff',
        role_description: 'Basic access',
        created_at: '2024-02-01',
        updated_at: '2024-03-15',
        status: 'inactive'
    },
];

const mockRoles: Role[] = [
    { id: 1, name: 'Admin', description: 'Full system access' },
    { id: 2, name: 'Manager', description: 'Inventory and requisition management' },
    { id: 3, name: 'Staff', description: 'Basic access' },
];

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const [showAddUser, setShowAddUser] = useState(false);
    const [showEditUser, setShowEditUser] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        fullname: '',
        username: '',
        role: '',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState<{[key: string]: string}>({});

    // Load users on component mount
    useEffect(() => {
        loadUsers();
    }, []);

    // Filter users based on search and filters
    useEffect(() => {
        const filtered = users.filter(user => {
            const matchesSearch = searchTerm === '' ||
                user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.username.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesRole = roleFilter === 'All' || user.role === roleFilter;
            const matchesStatus = statusFilter === 'All' || user.status === statusFilter;

            return matchesSearch && matchesRole && matchesStatus;
        });
        setFilteredUsers(filtered);
    }, [users, searchTerm, roleFilter, statusFilter]);

    const loadUsers = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setUsers(mockUsers);
            setIsLoading(false);
        }, 500);
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

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

        if (showAddUser && !formData.password) {
            newErrors.password = 'Password is required';
        }

        if (showAddUser && formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddUser = () => {
        if (validateForm()) {
            // In real application, send POST request to backend
            const newUser: User = {
                id: Math.max(...users.map(u => u.id), 0) + 1,
                fullname: formData.fullname,
                username: formData.username,
                role: formData.role,
                role_description: mockRoles.find(r => r.name === formData.role)?.description || '',
                created_at: new Date().toISOString().split('T')[0],
                updated_at: new Date().toISOString().split('T')[0],
                status: 'active'
            };

            setUsers(prev => [...prev, newUser]);
            setShowAddUser(false);
            resetForm();
            alert('User added successfully!');
        }
    };

    const handleEditUser = () => {
        if (validateForm() && selectedUser) {
            // In real application, send PUT request to backend
            const updatedUsers = users.map(user =>
                user.id === selectedUser.id
                    ? {
                        ...user,
                        fullname: formData.fullname,
                        username: formData.username,
                        role: formData.role,
                        role_description: mockRoles.find(r => r.name === formData.role)?.description || '',
                        updated_at: new Date().toISOString().split('T')[0],
                    }
                    : user
            );

            setUsers(updatedUsers);
            setShowEditUser(false);
            setSelectedUser(null);
            resetForm();
            alert('User updated successfully!');
        }
    };

    const handleDeleteUser = (userId: number) => {
        // In real application, send DELETE request to backend
        setUsers(prev => prev.filter(user => user.id !== userId));
        setShowDeleteConfirm(false);
        setSelectedUser(null);
        alert('User deleted successfully!');
    };

    const resetForm = () => {
        setFormData({
            fullname: '',
            username: '',
            role: '',
            password: '',
            password_confirmation: '',
        });
        setErrors({});
    };

    const openAddUser = () => {
        setShowAddUser(true);
        setShowEditUser(false);
        setSelectedUser(null);
        resetForm();
    };

    const openEditUser = (user: User) => {
        setShowEditUser(true);
        setShowAddUser(false);
        setSelectedUser(user);
        setFormData({
            fullname: user.fullname,
            username: user.username,
            role: user.role,
            password: '',
            password_confirmation: '',
        });
    };

    const closeModals = () => {
        setShowAddUser(false);
        setShowEditUser(false);
        setSelectedUser(null);
        resetForm();
    };

    const getStatusColor = (status: string) => {
        return status === 'active'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'Admin':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
            case 'Manager':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
            case 'Staff':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
                    </div>
                    <Button
                        onClick={openAddUser}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4" />
                        Add New User
                    </Button>
                </div>

                {/* Search and Filters */}
                <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10 w-full"
                            />
                        </div>

                        {/* Role Filter */}
                        <div>
                            <Label htmlFor="role-filter" className="text-sm font-medium mb-2 block">
                                Role
                            </Label>
                            <select
                                id="role-filter"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                            >
                                <option value="All">All Roles</option>
                                {mockRoles.map(role => (
                                    <option key={role.id} value={role.name}>{role.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <Label htmlFor="status-filter" className="text-sm font-medium mb-2 block">
                                Status
                            </Label>
                            <select
                                id="status-filter"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                            >
                                <option value="All">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border bg-white dark:bg-sidebar">
                    <div className="h-full overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-32">
                                <LoaderCircle className="w-6 h-6 animate-spin text-blue-600" />
                                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading users...</span>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-12">
                                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No users found
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    {searchTerm || roleFilter !== 'All' || statusFilter !== 'All'
                                        ? 'Try adjusting your search or filters'
                                        : 'Get started by adding your first user'
                                    }
                                </p>
                                {!searchTerm && roleFilter === 'All' && statusFilter === 'All' && (
                                    <Button onClick={openAddUser}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add New User
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-sidebar-accent border-b border-sidebar-border">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Updated
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-sidebar-border">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-sidebar-accent">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {user.fullname}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        @{user.username}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                        <Shield className="w-3 h-3 mr-1" />
                                                        {user.role}
                                                    </span>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {user.role_description}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                                        {user.status === 'active' ? 'Active' : 'Inactive'}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(user.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(user.updated_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditUser(user)}
                                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setShowDeleteConfirm(true);
                                                        }}
                                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add User Modal */}
            {(showAddUser || showEditUser) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-sidebar rounded-xl max-w-md w-full border border-sidebar-border">
                        <div className="p-6 border-b border-sidebar-border">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {showAddUser ? 'Add New User' : 'Edit User'}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {showAddUser
                                    ? 'Create a new user account'
                                    : `Edit ${selectedUser?.fullname}'s details`
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
                                    onChange={(e) => setFormData(prev => ({ ...prev, fullname: e.target.value }))}
                                    className={errors.fullname ? 'border-red-500' : ''}
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
                                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                                    className={errors.username ? 'border-red-500' : ''}
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
                                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white ${
                                        errors.role ? 'border-red-500' : 'border-sidebar-border'
                                    }`}
                                >
                                    <option value="">Select a role</option>
                                    {mockRoles.map(role => (
                                        <option key={role.id} value={role.name}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.role && (
                                    <p className="text-red-500 text-xs mt-1">{errors.role}</p>
                                )}
                            </div>

                            {/* Password (only for new users) */}
                            {showAddUser && (
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
                                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                            className={errors.password ? 'border-red-500' : ''}
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
                                            onChange={(e) => setFormData(prev => ({ ...prev, password_confirmation: e.target.value }))}
                                            className={errors.password_confirmation ? 'border-red-500' : ''}
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
                                onClick={closeModals}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={showAddUser ? handleAddUser : handleEditUser}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {showAddUser ? 'Add User' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-sidebar rounded-xl max-w-md w-full border border-sidebar-border">
                        <div className="p-6 border-b border-sidebar-border">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Delete User
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Are you sure you want to delete "{selectedUser.fullname}"? This action cannot be undone.
                            </p>
                        </div>
                        <div className="p-6 flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => handleDeleteUser(selectedUser.id)}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Delete User
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
