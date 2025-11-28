import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// Import components
import MakesCategoriesStats from './components/MakesCategoriesStats';
import MakesList from './components/MakesList';
import CategoriesList from './components/CategoriesList';
import MakeDetailModal from './components/MakeDetailModal';
import CategoryDetailModal from './components/CategoryDetailModal';

// Import utilities
import { transformMakesData, transformCategoriesData } from './utils';
import { useMakesCategoriesFilters } from './utils/hooks/useMakesCategoriesFilters';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Makes & Categories',
        href: '/makes-categories',
    },
];

export default function MakesAndCategories() {
    const [makesSearchTerm, setMakesSearchTerm] = useState('');
    const [categoriesSearchTerm, setCategoriesSearchTerm] = useState('');
    const [makeStatusFilter, setMakeStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [categoryTypeFilter, setCategoryTypeFilter] = useState<'all' | 'item' | 'service'>('all');
    const [selectedMake, setSelectedMake] = useState<any>(null);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [isMakeModalOpen, setIsMakeModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

    const [makes, setMakes] = useState(transformMakesData());
    const [categories, setCategories] = useState(transformCategoriesData());

    const {
        filteredMakes,
        filteredCategories
    } = useMakesCategoriesFilters(
        makes,
        categories,
        makesSearchTerm,
        categoriesSearchTerm,
        makeStatusFilter,
        categoryTypeFilter
    );

    const handleDeleteMake = (id: number) => {
        setMakes(prev => prev.filter(make => make.ID !== id));
        setIsMakeModalOpen(false);
    };

    const handleDeleteCategory = (id: number) => {
        setCategories(prev => prev.filter(category => category.CAT_ID !== id));
        setIsCategoryModalOpen(false);
    };

    const openMakeModal = (make: any) => {
        setSelectedMake(make);
        setIsMakeModalOpen(true);
    };

    const openCategoryModal = (category: any) => {
        setSelectedCategory(category);
        setIsCategoryModalOpen(true);
    };

    const closeAllModals = () => {
        setIsMakeModalOpen(false);
        setIsCategoryModalOpen(false);
        setSelectedMake(null);
        setSelectedCategory(null);
    };

    const clearMakesFilters = () => {
        setMakesSearchTerm('');
        setMakeStatusFilter('all');
    };

    const clearCategoriesFilters = () => {
        setCategoriesSearchTerm('');
        setCategoryTypeFilter('all');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Makes & Categories" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Makes & Categories</h1>
                    <div className="flex gap-3">
                        <Link
                            href="/makes-categories/category/add"
                            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Category
                        </Link>
                        <Link
                            href="/makes-categories/make/add"
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Make
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <MakesCategoriesStats makes={makes} categories={categories} />

                {/* Split Layout - Makes on Left, Categories on Right */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1">
                    {/* Makes Section - Left Side */}
                    <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border overflow-hidden flex flex-col">
                        <div className="border-b border-sidebar-border p-6 flex-shrink-0">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Makes</h2>
                                <div className="flex items-center gap-2">
                                    {(makesSearchTerm || makeStatusFilter !== 'all') && (
                                        <button
                                            onClick={clearMakesFilters}
                                            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {filteredMakes.length} {filteredMakes.length === 1 ? 'make' : 'makes'}
                                    </span>
                                </div>
                            </div>

                            {/* Makes Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                {/* Search */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search makes..."
                                        value={makesSearchTerm}
                                        onChange={(e) => setMakesSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/*/!* Status Filter *!/*/}
                                {/*<div>*/}
                                {/*    <select*/}
                                {/*        value={makeStatusFilter}*/}
                                {/*        onChange={(e) => setMakeStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}*/}
                                {/*        className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"*/}
                                {/*    >*/}
                                {/*        <option value="all">All Status</option>*/}
                                {/*        <option value="active">Active Only</option>*/}
                                {/*        <option value="inactive">Inactive Only</option>*/}
                                {/*    </select>*/}
                                {/*</div>*/}
                            </div>
                        </div>
                        <div className="flex-1">
                            <MakesList
                                makes={filteredMakes}
                                onMakeClick={openMakeModal}
                            />
                        </div>
                    </div>

                    {/* Categories Section - Right Side */}
                    <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border overflow-hidden flex flex-col">
                        <div className="border-b border-sidebar-border p-6 flex-shrink-0">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Categories</h2>
                                <div className="flex items-center gap-2">
                                    {(categoriesSearchTerm || categoryTypeFilter !== 'all') && (
                                        <button
                                            onClick={clearCategoriesFilters}
                                            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'}
                                    </span>
                                </div>
                            </div>

                            {/* Categories Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Search */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search categories..."
                                        value={categoriesSearchTerm}
                                        onChange={(e) => setCategoriesSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* Type Filter */}
                                <div>
                                    <select
                                        value={categoryTypeFilter}
                                        onChange={(e) => setCategoryTypeFilter(e.target.value as 'all' | 'item' | 'service')}
                                        className="w-full px-3 py-2 border border-sidebar-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-input text-gray-900 dark:text-white"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="item">Item Categories</option>
                                        <option value="service">Service Categories</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <CategoriesList
                                categories={filteredCategories}
                                onCategoryClick={openCategoryModal}
                            />
                        </div>
                    </div>
                </div>

                {/* Modals */}
                {isMakeModalOpen && (
                    <MakeDetailModal
                        make={selectedMake}
                        isOpen={isMakeModalOpen}
                        onClose={closeAllModals}
                        onEdit={() => {
                            window.location.href = `/makes-categories/make/${selectedMake.ID}/edit`;
                        }}
                        onDelete={handleDeleteMake}
                    />
                )}

                {isCategoryModalOpen && (
                    <CategoryDetailModal
                        category={selectedCategory}
                        isOpen={isCategoryModalOpen}
                        onClose={closeAllModals}
                        onEdit={() => {
                            window.location.href = `/makes-categories/category/${selectedCategory.CAT_ID}/edit`;
                        }}
                        onDelete={handleDeleteCategory}
                    />
                )}
            </div>
        </AppLayout>
    );
}
