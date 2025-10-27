// components/UserStats.tsx
interface UserStatsProps {
    users: any[];
}

export default function UserStats({ users }: UserStatsProps) {
    const activeUsers = users.filter(user => user.status === 'active').length;
    const inactiveUsers = users.filter(user => user.status === 'inactive').length;
    const adminUsers = users.filter(user => user.role === 'Admin').length;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{users.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
            </div>
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{activeUsers}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
            </div>
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{inactiveUsers}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Inactive</div>
            </div>
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{adminUsers}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Admins</div>
            </div>
        </div>
    );
}
