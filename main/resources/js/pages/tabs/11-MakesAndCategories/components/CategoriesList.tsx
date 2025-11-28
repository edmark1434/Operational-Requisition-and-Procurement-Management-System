import { Link } from '@inertiajs/react';
import { getCategoryTypeColor } from '../utils/styleutils';
import { Edit } from 'lucide-react';

interface CategoriesListProps {
    categories: any[];
    onCategoryClick: (category: any) => void;
}

export default function CategoriesList({ categories, onCategoryClick }: CategoriesListProps) {
    if (categories.length === 0) {
        return (
            <div className="p-8 text-center">
                <div className="text-gray-400 dark:text-gray-600 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No categories found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try adjusting your search.</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-sidebar-border">
            {categories.map((category) => {
                const typeText = category.TYPE === 'item' ? 'Item' : 'Service';

                return (
                    <div
                        key={category.CAT_ID}
                        className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-sidebar transition-colors cursor-pointer"
                        onClick={() => onCategoryClick(category)}
                    >
                        {/* Category Info */}
                        <div className="col-span-4 flex items-center space-x-3">
                            <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {category.NAME}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="col-span-3 flex items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                Click to View
                            </span>
                        </div>

                        {/* Type */}
                        <div className="col-span-2 flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryTypeColor(category.TYPE)}`}>
                                {typeText}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="col-span-3 flex items-center justify-end space-x-2">
                            <Link
                                href={`/makes-categories/category/${category.CAT_ID}/edit`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 rounded"
                                title="Edit Category"
                            >
                                <Edit className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
