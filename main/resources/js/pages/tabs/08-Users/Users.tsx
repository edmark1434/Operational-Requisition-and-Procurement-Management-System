// Users.tsx
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Toaster, toast } from 'sonner';
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
import { usereditStatus } from '@/routes';

interface User {
    id: number;
    fullname: string;
    username: string;
    created_at: string;
    status: 'active' | 'inactive';
}
interface Prop{
    usersList: any[],
    permissions: any[],
    rolesList: any[],
    role_perm: any[],
    success: boolean,
    message: string
}
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    },
];

export default function Users({usersList,permissions,rolesList,role_perm,success,message}:Prop) {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { props } = usePage();
    const permissionsList = props.user_permission as string[];

    console.log(permissionsList); // ["create_item", "edit_item", "delete_item"]
    // Load users on component mount
    useEffect(() => {
        loadUsers();
        if (success) {
            toast(message);
        }
    }, [success]);
    // Filter users based on search and filters
    useEffect(() => {
        const filtered = users.filter(user => {
            const matchesSearch = searchTerm === '' ||
                user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.username.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'All' || user.status === statusFilter;

            return matchesSearch && matchesStatus;
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
        return usersList.map(user => {
            // Find user roles

            // Get primary role (first role found, or default to 'User')

            return {
                id: user.id,
                fullname: user.fullname,
                username: user.username,
                created_at: user.created_at,
                status: user.status
            };
        });
    };

    // Get available roles for filter dropdown
    const getAvailableRoles = () => {
        const uniqueRoles = [...new Set(rolesList.map(role => role.NAME))];
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
                } : user
            )
        );
        router.put(usereditStatus(id), { newStatus });
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

                    { permissionsList.includes('Create User') &&
                        <Link
                            href="/users/add"
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            <Plus className="w-4 h-4" />
                            Create New User
                        </Link>
                    }

                </div>

                {/* Stats */}
                <UserStats users={users} />
                <Toaster/>
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
