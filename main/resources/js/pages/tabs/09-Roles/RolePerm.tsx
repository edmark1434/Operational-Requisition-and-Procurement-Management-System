import { PlaceholderPattern } from "@/components/ui/placeholder-pattern";
import AppLayout from '@/layouts/app-layout';
import { roles } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles & Perms',
        href: roles().url,
    },
];

export default function RolePerm() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Role & Perms" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">

                <h1 className="text-2xl font-bold">Role & Perms</h1>

                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    <div className="absolute inset-0 flex items-center justify-center text-lg font-medium">
                        Roles & Perms Placeholder
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
