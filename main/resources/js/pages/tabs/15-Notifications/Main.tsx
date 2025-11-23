import AppLayout from '@/layouts/app-layout';
import {notifications} from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notifications',
        href: notifications().url,
    },
];

export default function Notifications() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">EMPTY SAMPLE</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">

                        </p>
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-white dark:bg-sidebar rounded-lg border border-sidebar-border p-8 text-center">
                    <div className="py-12">
                        <p className="text-gray-500 dark:text-gray-400">
                            content will be displayed here.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
