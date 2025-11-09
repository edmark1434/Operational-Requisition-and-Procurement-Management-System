interface SupplierStatsProps {
    suppliers: any[];
}

export default function SupplierStats({ suppliers }: SupplierStatsProps) {
    const totalSuppliers = suppliers.length;
    const cashSuppliers = suppliers.filter(s => s.ALLOWS_CASH).length;
    const disbursementSuppliers = suppliers.filter(s => s.ALLOWS_DISBURSEMENT).length;
    const storeCreditSuppliers = suppliers.filter(s => s.ALLOWS_STORE_CREDIT).length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Suppliers */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {totalSuppliers}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Suppliers</div>
            </div>

            {/* Cash Suppliers */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {cashSuppliers}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Accept Cash</div>
            </div>

            {/* Disbursement Suppliers */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {disbursementSuppliers}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Accept Disbursement</div>
            </div>

            {/* Store Credit Suppliers */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {storeCreditSuppliers}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Accept Store Credit</div>
            </div>
        </div>
    );
}
