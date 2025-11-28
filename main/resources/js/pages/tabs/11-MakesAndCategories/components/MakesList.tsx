import { Link } from '@inertiajs/react';
import { getStatusColor } from '../utils/styleutils';
import { Edit } from 'lucide-react';

interface MakesListProps {
    makes: any[];
    onMakeClick: (make: any) => void;
}

export default function MakesList({ makes, onMakeClick }: MakesListProps) {
    if (makes.length === 0) {
        return (
            <div className="p-8 text-center">
                <div className="text-gray-400 dark:text-gray-600 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No makes found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try adjusting your search.</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-sidebar-border">
            {makes.map((make) => {
                const status = make.IS_ACTIVE ? 'active' : 'inactive';
                const statusText = make.IS_ACTIVE ? 'Active' : 'Inactive';

                return (
                    <div
                        key={make.ID}
                        className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-sidebar transition-colors cursor-pointer"
                        onClick={() => onMakeClick(make)}
                    >
                        {/* Make Info */}
                        <div className="col-span-4 flex items-center space-x-3">
                            <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {make.NAME}
                                </div>
                                {/*<div className="text-xs text-gray-500 dark:text-gray-400">*/}
                                {/*    #{make.ID}*/}
                                {/*</div>*/}
                            </div>
                        </div>

                        {/*/!* Status *!/*/}
                        {/*<div className="col-span-3 flex items-center">*/}
                        {/*    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>*/}
                        {/*        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>*/}
                        {/*        {statusText}*/}
                        {/*    </div>*/}
                        {/*</div>*/}

                        {/* Last Updated */}
                        <div className="col-span-6 flex items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Click to View
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="col-span-2 flex items-center justify-end space-x-2">
                            <Link
                                href={`/makes-categories/make/${make.ID}/edit`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 rounded"
                                title="Edit Make"
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
