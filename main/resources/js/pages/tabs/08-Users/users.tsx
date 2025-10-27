// Users.tsx
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { LoaderCircle, Search, Plus, Edit, Trash2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import UserModal from './components/user-modal';
import DeleteConfirmationModal from './components/delete-confirmation-modal';

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
    const [modalState, setModalState] = useState<'add' | 'edit' | 'delete' | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

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

    const handleAddUser = (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
        const newUser: User = {
            id: Math.max(...users.map(u => u.id), 0) + 1,
            ...userData,
            created_at: new Date().toISOString().split('T')[0],
            updated_at: new Date().toISOString().split('T')[0],
        };

        setUsers(prev => [...prev, newUser]);
        setModalState(null);
    };

    const handleEditUser = (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
        if (!selectedUser) return;

        const updatedUsers = users.map(user =>
            user.id === selectedUser.id
                ? {
                    ...user,
                    ...userData,
                    updated_at: new Date().toISOString().split('T')[0],
                }
                : user
        );

        setUsers(updatedUsers);
        setModalState(null);
        setSelectedUser(null);
    };

    const handleDeleteUser = () => {
        if (!selectedUser) return;

        setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
        setModalState(null);
        setSelectedUser(null);
    };

    const openAddUser = () => {
        setModalState('add');
        setSelectedUser(null);
    };

    const openEditUser = (user: User) => {
        setModalState('edit');
        setSelectedUser(user);
    };

    const openDeleteUser = (user: User) => {
        setModalState('delete');
        setSelectedUser(user);
    };

    const closeModals = () => {
        setModalState(null);
        setSelectedUser(null);
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
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Manage system users and their permissions
                        </p>
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
                                                        onClick={() => openDeleteUser(user)}
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

            {/* User Modal */}
            {(modalState === 'add' || modalState === 'edit') && (
                <UserModal
                    mode={modalState}
                    user={selectedUser}
                    roles={mockRoles}
                    onSave={modalState === 'add' ? handleAddUser : handleEditUser}
                    onClose={closeModals}
                />
            )}

            {/* Delete Confirmation Modal */}
            {modalState === 'delete' && selectedUser && (
                <DeleteConfirmationModal
                    user={selectedUser}
                    onConfirm={handleDeleteUser}
                    onClose={closeModals}
                />
            )}
        </AppLayout>
    );
}
