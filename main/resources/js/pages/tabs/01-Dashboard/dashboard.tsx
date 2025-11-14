import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    Users,
    Package,
    ShoppingCart,
    Truck,
    AlertTriangle,
    CheckCircle,
    Clock,
    TrendingUp,
    BarChart3
} from 'lucide-react';
import { LucideProps } from 'lucide-react';

// Import datasets
import users from '@/pages/datasets/user';
import requisitions from '@/pages/datasets/requisition';
import { purchaseOrdersData } from '@/pages/datasets/purchase_order';
import deliveries from '@/pages/datasets/delivery';
import items from '@/pages/datasets/items';
import categories from '@/pages/datasets/category';
import returns from '@/pages/datasets/returns';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
    trend?: {
        value: string;
        color: string;
    };
    description?: string;
    color?: string;
}

interface StatusBadgeProps {
    status: string;
}

const StatCard = ({ title, value, icon: Icon, trend, description, color = 'blue' }: StatCardProps) => (
    <div className="bg-white dark:bg-sidebar rounded-xl border border-sidebar-border/70 p-6">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
                {description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
                )}
            </div>
            <div className={`p-3 rounded-lg ${
                color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20' :
                    color === 'green' ? 'bg-green-50 dark:bg-green-900/20' :
                        color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20' :
                            color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20' :
                                'bg-blue-50 dark:bg-blue-900/20'
            }`}>
                <Icon className={`h-6 w-6 ${
                    color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                        color === 'green' ? 'text-green-600 dark:text-green-400' :
                            color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                                color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                                    'text-blue-600 dark:text-blue-400'
                }`} />
            </div>
        </div>
        {trend && (
            <div className="flex items-center mt-3">
                <TrendingUp className={`h-4 w-4 ${
                    trend.color === 'green' ? 'text-green-500' :
                        trend.color === 'red' ? 'text-red-500' :
                            'text-blue-500'
                } mr-1`} />
                <span className={`text-sm ${
                    trend.color === 'green' ? 'text-green-600 dark:text-green-400' :
                        trend.color === 'red' ? 'text-red-600 dark:text-red-400' :
                            'text-blue-600 dark:text-blue-400'
                }`}>
                    {trend.value}
                </span>
            </div>
        )}
    </div>
);

const StatusBadge = ({ status }: StatusBadgeProps) => {
    const statusConfig: Record<string, { color: string; icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>> }> = {
        'Approved': { color: 'green', icon: CheckCircle },
        'Pending': { color: 'yellow', icon: Clock },
        'Declined': { color: 'red', icon: AlertTriangle },
        'delivered': { color: 'green', icon: CheckCircle },
        'pending': { color: 'yellow', icon: Clock },
        'completed': { color: 'green', icon: CheckCircle }
    };

    const config = statusConfig[status] || { color: 'gray', icon: Clock };
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            config.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                config.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    config.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }`}>
            <Icon className="w-3 h-3 mr-1" />
            {status}
        </span>
    );
};

export default function Dashboard() {
    // Calculate statistics
    const totalUsers = users.length;
    const totalItems = items.length;
    const totalRequisitions = requisitions.length;
    const totalPurchaseOrders = purchaseOrdersData.length;
    const totalDeliveries = deliveries.length;

    // Status counts
    const pendingRequisitions = requisitions.filter(req => req.STATUS === 'Pending').length;
    const approvedRequisitions = requisitions.filter(req => req.STATUS === 'Approved').length;
    const pendingDeliveries = deliveries.filter(del => del.STATUS === 'pending').length;
    const completedDeliveries = deliveries.filter(del => del.STATUS === 'delivered').length;

    // Low stock items (stock < 10)
    const lowStockItems = items.filter(item => item.CURRENT_STOCK < 10).length;
    const outOfStockItems = items.filter(item => item.CURRENT_STOCK === 0).length;

    // Recent activity
    const recentRequisitions = requisitions.slice(0, 5);
    const recentDeliveries = deliveries.slice(0, 5);

    // Category distribution
    const categoryDistribution = categories.map(category => ({
        name: category.NAME,
        count: items.filter(item => item.CATEGORY_ID === category.CAT_ID).length,
        stock: items.filter(item => item.CATEGORY_ID === category.CAT_ID)
            .reduce((sum, item) => sum + item.CURRENT_STOCK, 0)
    }));

    // Performance metrics calculations
    const approvalRate = totalRequisitions > 0 ? Math.round((approvedRequisitions / totalRequisitions) * 100) : 0;
    const deliveryCompletionRate = totalDeliveries > 0 ? Math.round((completedDeliveries / totalDeliveries) * 100) : 0;
    const stockAvailabilityRate = totalItems > 0 ? Math.round(((totalItems - outOfStockItems) / totalItems) * 100) : 0;
    const totalStockUnits = items.reduce((sum, item) => sum + item.CURRENT_STOCK, 0);
    const totalDeliveryValue = deliveries.reduce((sum, del) => sum + del.TOTAL_COST, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <BarChart3 className="h-5 w-5" />
                        <span className="text-sm">Last updated: Today</span>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Users"
                        value={totalUsers}
                        icon={Users}
                        color="blue"
                        description="Active system users"
                    />
                    <StatCard
                        title="Inventory Items"
                        value={totalItems}
                        icon={Package}
                        color="green"
                        description={`${lowStockItems} low stock`}
                    />
                    <StatCard
                        title="Requisitions"
                        value={totalRequisitions}
                        icon={ShoppingCart}
                        color="purple"
                        description={`${pendingRequisitions} pending`}
                    />
                    <StatCard
                        title="Purchase Orders"
                        value={totalPurchaseOrders}
                        icon={Truck}
                        color="orange"
                        description={`${pendingDeliveries} in delivery`}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Requisitions */}
                    <div className="lg:col-span-2 bg-white dark:bg-sidebar rounded-xl border border-sidebar-border/70 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Recent Requisitions
                            </h2>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Last 5 requests
                            </span>
                        </div>
                        <div className="space-y-4">
                            {recentRequisitions.map(requisition => (
                                <div key={requisition.REQ_ID} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-sidebar-accent rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {requisition.REQUESTOR}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {requisition.NOTES}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {requisition.DATE_REQUESTED}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <StatusBadge status={requisition.STATUS} />
                                        <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                            #{requisition.REQ_ID}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Inventory Overview */}
                    <div className="bg-white dark:bg-sidebar rounded-xl border border-sidebar-border/70 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                            Inventory Overview
                        </h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                <div className="flex items-center">
                                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
                                    <div>
                                        <p className="font-medium text-red-800 dark:text-red-200">Out of Stock</p>
                                        <p className="text-sm text-red-600 dark:text-red-400">{outOfStockItems} items</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <div className="flex items-center">
                                    <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3" />
                                    <div>
                                        <p className="font-medium text-yellow-800 dark:text-yellow-200">Low Stock</p>
                                        <p className="text-sm text-yellow-600 dark:text-yellow-400">{lowStockItems} items</p>
                                    </div>
                                </div>
                            </div>

                            {/* Category Distribution */}
                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                    Items by Category
                                </h3>
                                <div className="space-y-2">
                                    {categoryDistribution.map(category => (
                                        <div key={category.name} className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {category.name}
                                            </span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {category.count} items
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Deliveries */}
                    <div className="bg-white dark:bg-sidebar rounded-xl border border-sidebar-border/70 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Recent Deliveries
                            </h2>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Last 5 deliveries
                            </span>
                        </div>
                        <div className="space-y-4">
                            {recentDeliveries.map(delivery => (
                                <div key={delivery.ID} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-sidebar-accent rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {delivery.SUPPLIER_NAME}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {delivery.RECEIPT_NO}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {delivery.DELIVERY_DATE} • ${delivery.TOTAL_COST}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <StatusBadge status={delivery.STATUS} />
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {delivery.ITEMS.length} items
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="bg-white dark:bg-sidebar rounded-xl border border-sidebar-border/70 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                            Performance Metrics
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Requisition Approval Rate
                                    </span>
                                    <span className={`text-sm font-bold ${
                                        approvalRate >= 80 ? 'text-green-600 dark:text-green-400' :
                                            approvalRate >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                                                'text-red-600 dark:text-red-400'
                                    }`}>
                                        {approvalRate}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${
                                            approvalRate >= 80 ? 'bg-green-600' :
                                                approvalRate >= 60 ? 'bg-yellow-600' :
                                                    'bg-red-600'
                                        }`}
                                        style={{ width: `${approvalRate}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {approvedRequisitions} of {totalRequisitions} requisitions approved
                                </p>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Delivery Completion
                                    </span>
                                    <span className={`text-sm font-bold ${
                                        deliveryCompletionRate >= 90 ? 'text-green-600 dark:text-green-400' :
                                            deliveryCompletionRate >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
                                                'text-red-600 dark:text-red-400'
                                    }`}>
                                        {deliveryCompletionRate}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${
                                            deliveryCompletionRate >= 90 ? 'bg-green-600' :
                                                deliveryCompletionRate >= 70 ? 'bg-yellow-600' :
                                                    'bg-red-600'
                                        }`}
                                        style={{ width: `${deliveryCompletionRate}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {completedDeliveries} of {totalDeliveries} deliveries completed
                                </p>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Stock Availability
                                    </span>
                                    <span className={`text-sm font-bold ${
                                        stockAvailabilityRate >= 95 ? 'text-green-600 dark:text-green-400' :
                                            stockAvailabilityRate >= 85 ? 'text-yellow-600 dark:text-yellow-400' :
                                                'text-red-600 dark:text-red-400'
                                    }`}>
                                        {stockAvailabilityRate}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${
                                            stockAvailabilityRate >= 95 ? 'bg-green-600' :
                                                stockAvailabilityRate >= 85 ? 'bg-yellow-600' :
                                                    'bg-red-600'
                                        }`}
                                        style={{ width: `${stockAvailabilityRate}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {totalItems - outOfStockItems} of {totalItems} items in stock
                                </p>
                            </div>

                            <div className="pt-4 border-t border-sidebar-border/70">
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {totalStockUnits.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Stock Units</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            ${totalDeliveryValue.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Delivery Value</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
