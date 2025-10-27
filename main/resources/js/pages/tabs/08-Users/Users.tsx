// Users.tsx
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

// Import components
import UserStats from './UserStats';
import UserSearchAndFilters from './UserSearchAndFilters';
import UsersList from './UsersList';
import UserDetailModal from './UserDetailModal';

// Import all datasets
import mockUsers from '../../datasets/user';
import userRoles from '../../datasets/user_role';
import roles from '../../datasets/role';
import rolePermissions from '../../datasets/role_permission';

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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    },
];

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
            const transformedUsers = transformUserData();
            setUsers(transformedUsers);
            setIsLoading(false);
        }, 500);
    };

    const transformUserData = (): User[] => {
        return mockUsers.map(user => {
            // Find user roles
            const userRoleRelations = userRoles.filter(ur => ur.US_ID === user.US_ID);

            // Get primary role (first role found, or default to 'User')
            const primaryRole = userRoleRelations.length > 0
                ? roles.find(role => role.RO_ID === userRoleRelations[0].RO_ID)
                : null;

            return {
                id: user.US_ID,
                fullname: user.FULLNAME,
                username: user.NAME,
                role: primaryRole ? primaryRole.NAME : 'User',
                role_description: primaryRole ? primaryRole.DESCRIPTION : 'Basic user access',
                created_at: user.DATE_CREATED,
                updated_at: user.DATE_UPDATED, // Use DATE_UPDATED from dataset
                status: Math.random() > 0.3 ? 'active' : 'inactive' as 'active' | 'inactive'
            };
        });
    };

    // Get available roles for filter dropdown
    const getAvailableRoles = () => {
        const uniqueRoles = [...new Set(users.map(user => user.role))];
        return ['All', ...uniqueRoles];
    };

    const openModal = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleStatusUpdate = (id: number, newStatus: 'active' | 'inactive') => {
        setUsers(prev =>
            prev.map(user =>
                user.id === id ? {
                    ...user,
                    status: newStatus,
                    updated_at: new Date().toISOString().split('T')[0] + ' ' +
                        new Date().toTimeString().split(' ')[0]
                } : user
            )
        );
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
                    <Link
                        href="/users/add"
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        <Plus className="w-4 h-4" />
                        Create New User
                    </Link>
                </div>

                {/* Stats */}
                <UserStats users={users} />

                {/* Search and Filters */}
                <UserSearchAndFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    roleFilter={roleFilter}
                    setRoleFilter={setRoleFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    resultsCount={filteredUsers.length}
                    availableRoles={getAvailableRoles()}
                />

                {/* Users List */}
                <UsersList
                    users={filteredUsers}
                    isLoading={isLoading}
                    onUserClick={openModal}
                />

                {/* User Detail Modal */}
                {selectedUser && (
                    <UserDetailModal
                        user={selectedUser}
                        isOpen={isModalOpen}
                        onClose={closeModal}
                        onStatusUpdate={handleStatusUpdate}
                    />
                )}
            </div>
        </AppLayout>
    );
}
