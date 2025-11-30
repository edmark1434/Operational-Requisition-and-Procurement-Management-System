interface MakesCategoriesStatsProps {
    makes: any[];
    categories: any[];
}

export default function MakesCategoriesStats({ makes, categories }: MakesCategoriesStatsProps) {
    const totalMakes = makes.length;
    const activeMakes = makes.filter(make => make.IS_ACTIVE).length;
    const totalCategories = categories.length;
    const itemCategories = categories.filter(cat => cat.TYPE === 'Items').length;
    const serviceCategories = categories.filter(cat => cat.TYPE === 'Services').length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Makes */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {totalMakes}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Makes</div>
            </div>

            {/* Active Makes */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {activeMakes}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Makes</div>
            </div>

            {/* Total Categories */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {totalCategories}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Categories</div>
            </div>

            {/* Categories by Type */}
            <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-4">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 whitespace-nowrap">
                    {itemCategories} / {serviceCategories}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Item / Service Categories</div>
            </div>
        </div>
    );
}
