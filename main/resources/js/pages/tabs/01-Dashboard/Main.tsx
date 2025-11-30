import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Users,
    Package,
    ShoppingCart,
    Truck,
    RotateCcw,
    Settings,
    AlertTriangle,
    CheckCircle,
    Clock
} from 'lucide-react';
import { LucideProps } from 'lucide-react';

// Import datasets
import users from '@/pages/datasets/user';
import requisitions from '@/pages/datasets/requisition';
import { purchaseOrdersData } from '@/pages/datasets/purchase_order';
import deliveries from '@/pages/datasets/delivery';
import items from '@/pages/datasets/items';
import returns from '@/pages/datasets/returns';
import reworks from '@/pages/datasets/reworks';

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
    description?: string;
    color?: string;
    href?: string;
}

interface StatusBadgeProps {
    status: string;
}

const StatCard = ({ title, value, icon: Icon, description, color = 'blue', href }: StatCardProps) => {
    const cardContent = (
        <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
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
                                    color === 'red' ? 'bg-red-50 dark:bg-red-900/20' :
                                        'bg-blue-50 dark:bg-blue-900/20'
                }`}>
                    <Icon className={`h-6 w-6 ${
                        color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                            color === 'green' ? 'text-green-600 dark:text-green-400' :
                                color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                                    color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                                        color === 'red' ? 'text-red-600 dark:text-red-400' :
                                            'text-blue-600 dark:text-blue-400'
                    }`} />
                </div>
            </div>
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="block hover:opacity-80 transition-opacity">
                {cardContent}
            </Link>
        );
    }

    return cardContent;
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
    const statusConfig: Record<string, { color: string; icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>> }> = {
        'Approved': { color: 'green', icon: CheckCircle },
        'Pending': { color: 'yellow', icon: Clock },
        'Declined': { color: 'red', icon: AlertTriangle },
        'delivered': { color: 'green', icon: CheckCircle },
        'pending': { color: 'yellow', icon: Clock },
        'completed': { color: 'green', icon: CheckCircle },
        'received': { color: 'green', icon: CheckCircle },
        'with returns': { color: 'orange', icon: AlertTriangle }
    };

    const config = statusConfig[status] || { color: 'gray', icon: Clock };
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            config.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                config.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    config.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        config.color === 'orange' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }`}>
            <Icon className="w-3 h-3 mr-1" />
            {status}
        </span>
    );
};
interface Prop{
    requisitions: any[],
    deliveries: any[],
    purchaseOrdersData: any[],
    returns: any[],
    reworks: any[],
    items: any[]
}

export default function Dashboard({requisitions,deliveries,returns,reworks,purchaseOrdersData,items}:Prop) {
    // Calculate statistics
    const totalUsers = users.length;
    const totalItems = items.length;
    const totalRequisitions = requisitions.length;
    const totalPurchaseOrders = purchaseOrdersData.length;
    const totalDeliveries = deliveries.length;
    const totalReturns = returns.length;
    const totalReworks = reworks.length;

    // Status counts
    const pendingRequisitions = requisitions.filter(req => req.STATUS === 'Pending').length;
    const approvedRequisitions = requisitions.filter(req => req.STATUS === 'Approved').length;
    const pendingDeliveries = deliveries.filter(del => del.STATUS === 'pending').length;
    const completedDeliveries = deliveries.filter(del => del.STATUS === 'received').length;
    const pendingReturns = returns.filter(ret => ret.STATUS === 'pending').length;
    const pendingReworks = reworks.filter(rework => rework.STATUS === 'pending').length;

    // Low stock items (stock < 10)
    const lowStockItems = items.filter(item => item.CURRENT_STOCK < 10).length;
    const outOfStockItems = items.filter(item => item.CURRENT_STOCK === 0).length;

    // Recent activity
    const recentRequisitions = requisitions.slice(0, 5);
    const recentPurchaseOrders = purchaseOrdersData.slice(0, 5);
    const recentDeliveries = deliveries.slice(0, 5);
    const recentReturns = returns.slice(0, 5);
    const recentReworks = reworks.slice(0, 5);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Requisitions"
                        value={totalRequisitions}
                        icon={ShoppingCart}
                        color="purple"
                        description={`${pendingRequisitions} pending`}
                        href="/requisitions"
                    />
                    <StatCard
                        title="Purchase Orders"
                        value={totalPurchaseOrders}
                        icon={Package}
                        color="blue"
                        description={`${totalPurchaseOrders} total`}
                        href="/purchases"
                    />
                    <StatCard
                        title="Deliveries"
                        value={totalDeliveries}
                        icon={Truck}
                        color="green"
                        description={`${completedDeliveries} completed`}
                        href="/deliveries"
                    />
                    <StatCard
                        title="Returns & Reworks"
                        value={totalReturns + totalReworks}
                        icon={RotateCcw}
                        color="orange"
                        description={`${pendingReturns} returns, ${pendingReworks} reworks`}
                        href="/returns"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Recent Requisitions */}
                    <div className="bg-white dark:bg-sidebar rounded-xl border border-sidebar-border p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Recent Requisitions
                            </h2>
                            <Link
                                href="/requisitions"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            >
                                View all
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {recentRequisitions.map(requisition => (
                                <div key={requisition.ID} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-medium text-gray-900 dark:text-white truncate">
                                                {requisition.REQUESTOR}
                                            </p>
                                            <StatusBadge status={requisition.STATUS} />
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                            {requisition.NOTES}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {requisition.CREATED_AT}
                                        </p>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            #{requisition.ID}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                            {requisition.TYPE}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Purchase Orders */}
                    <div className="bg-white dark:bg-sidebar rounded-xl border border-sidebar-border p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Recent Purchase Orders
                            </h2>
                            <Link
                                href="/purchases"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            >
                                View all
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {recentPurchaseOrders.map(po => (
                                <div key={po.ID} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-medium text-gray-900 dark:text-white truncate">
                                                {po.SUPPLIER_NAME}
                                            </p>
                                            <StatusBadge status={po.STATUS} />
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {po.REFERENCE_NO}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {po.CREATED_AT} • ${po.TOTAL_COST}
                                        </p>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            #{po.ID}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                            {po.ORDER_TYPE}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Deliveries */}
                    <div className="bg-white dark:bg-sidebar rounded-xl border border-sidebar-border p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Recent Deliveries
                            </h2>
                            <Link
                                href="/deliveries"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            >
                                View all
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {recentDeliveries.map(delivery => (
                                <div key={delivery.ID} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-medium text-gray-900 dark:text-white truncate">
                                                {delivery.SUPPLIER_NAME}
                                            </p>
                                            <StatusBadge status={delivery.STATUS} />
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {delivery.RECEIPT_NO}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {delivery.DELIVERY_DATE} • ${delivery.TOTAL_COST}
                                        </p>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            #{delivery.ID}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                            {delivery.DELIVERY_TYPE}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Returns & Reworks */}
                    <div className="bg-white dark:bg-sidebar rounded-xl border border-sidebar-border p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Recent Returns & Reworks
                            </h2>
                            <Link
                                href="/returns"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            >
                                View all
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {/* Returns */}
                            {recentReturns.map(returnItem => (
                                <div key={`return-${returnItem.ID}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-medium text-gray-900 dark:text-white truncate">
                                                {returnItem.SUPPLIER_NAME}
                                            </p>
                                            <StatusBadge status={returnItem.STATUS} />
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                            {returnItem.REMARKS}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {returnItem.CREATED_AT}
                                        </p>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            R#{returnItem.ID}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Return
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {/* Reworks */}
                            {recentReworks.map(rework => (
                                <div key={`rework-${rework.ID}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-sidebar-accent rounded-lg border border-sidebar-border">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-medium text-gray-900 dark:text-white truncate">
                                                {rework.SUPPLIER_NAME}
                                            </p>
                                            <StatusBadge status={rework.STATUS} />
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                            {rework.REMARKS}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {rework.CREATED_AT}
                                        </p>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            RW#{rework.ID}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Rework
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Inventory Alerts */}
                <div className="bg-white dark:bg-sidebar rounded-xl border border-sidebar-border p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        Inventory Alerts
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400 mr-4" />
                            <div>
                                <p className="font-medium text-red-800 dark:text-red-200">Out of Stock</p>
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{outOfStockItems}</p>
                                <p className="text-sm text-red-600 dark:text-red-400">items need restocking</p>
                            </div>
                        </div>
                        <div className="flex items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                            <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400 mr-4" />
                            <div>
                                <p className="font-medium text-orange-800 dark:text-orange-200">Low Stock</p>
                                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{lowStockItems}</p>
                                <p className="text-sm text-orange-600 dark:text-orange-400">items running low</p>
                            </div>
                        </div>
                        <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <Package className="h-8 w-8 text-green-600 dark:text-green-400 mr-4" />
                            <div>
                                <p className="font-medium text-green-800 dark:text-green-200">Total Inventory</p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalItems}</p>
                                <p className="text-sm text-green-600 dark:text-green-400">items in system</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
