import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard, requisitions, inventory, purchases,
    suppliers, delivery, returnsIndex, audit, users,
    roles, makesandcategories, services, reworks,
    contacts, notifications
} from '@/routes';

import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, NotepadTextIcon,
    Package, ShoppingCart, Contact, SquareArrowDownIcon,
    LucideLogs, User, Shield, Truck, Tags, HandPlatter, Waypoints,
    Container, Bell
} from 'lucide-react';
import AppLogo from './app-logo';

// Define nav items with required permissions
const allNavItems = {
    group1: [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
            requiredPermission: null, // Set to null to always show
        },
        {
            title: 'Inventory',
            href: inventory(),
            icon: Package,
            requiredPermission: 'View Items',
        },
        {
            title: 'Makes & Categories',
            href: makesandcategories(),
            icon: Tags,
            requiredPermission: 'View Makes',
        },
        {
            title: 'Services',
            href: services(),
            icon: HandPlatter,
            requiredPermission: 'View Services',
        },
    ],

    group2: [
        {
            title: 'Requisitions',
            href: requisitions(),
            icon: NotepadTextIcon,
            requiredPermission: 'View Requisitions',
        },
        {
            title: 'Purchase Orders',
            href: purchases(),
            icon: ShoppingCart,
            requiredPermission: 'View Purchase Orders',
        },
        {
            title: 'Deliveries',
            href: delivery(),
            icon: Truck,
            requiredPermission: 'View Deliveries',
        },
        {
            title: 'Returns',
            href: returnsIndex(),
            icon: SquareArrowDownIcon,
            requiredPermission: 'View Returns',
        },
        {
            title: 'Reworks',
            href: reworks(),
            icon: Waypoints,
            requiredPermission: 'View Reworks',
        },
    ],

    group3: [
        {
            title: 'Vendors',
            href: suppliers(),
            icon: Container,
            requiredPermission: 'View Vendors',
        },
        {
            title: 'Contacts',
            href: contacts(),
            icon: Contact,
            requiredPermission: 'View Contacts',
        },
        {
            title: 'Users',
            href: users(),
            icon: User,
            requiredPermission: 'View Users',
        },
        {
            title: 'Roles & Permissions',
            href: roles(),
            icon: Shield,
            requiredPermission: 'View Roles and Permissions',
        },
    ],

    group4: [
        {
            title: 'Audit Logs',
            href: audit(),
            icon: LucideLogs,
            requiredPermission: null,
        },
        {
            title: 'Notifications',
            href: notifications(),
            icon: Bell,
            requiredPermission: null,
        },
    ],
};

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

// Simple separator component
function SidebarSeparator() {
    return (
        <div className="h-px bg-sidebar-border mx-2 my-2" />
    );
}

export function AppSidebar() {
    // Use usePage to directly access props
    const { props } = usePage();
    console.log('All props from usePage:', props);

    // Get permissions from props - try different possible property names
    const userPermissions =
        props.user_permission ||
        props.user_permissions ||
        props.permissions ||
        props.user?.permissions ||
        [];

    console.log('Extracted permissions:', userPermissions);

    // Filter function - always show Dashboard
    const filterItemsByPermission = (items: any[]): NavItem[] => {
        return items.filter(item => {
            // Always show Dashboard (requiredPermission is null)
            if ( item.requiredPermission === null ) {
                console.log(`Always showing: ${item.title}`);
                return true;
            }

            // For other items, check permission
            if (!item.requiredPermission) return true;

            const hasPermission = userPermissions.includes(item.requiredPermission);
            console.log(`Checking ${item.title}: ${item.requiredPermission} - ${hasPermission}`);
            return hasPermission;
        }).map(({ requiredPermission, ...item }) => item);
    };

    // Create filtered navigation items
    const group1NavItems = filterItemsByPermission(allNavItems.group1);
    const group2NavItems = filterItemsByPermission(allNavItems.group2);
    const group3NavItems = filterItemsByPermission(allNavItems.group3);
    const group4NavItems = filterItemsByPermission(allNavItems.group4);

    // Check if any group has items after filtering
    const hasGroup1 = group1NavItems.length > 0;
    const hasGroup2 = group2NavItems.length > 0;
    const hasGroup3 = group3NavItems.length > 0;
    const hasGroup4 = group4NavItems.length > 0;

    console.log('Group 1 items after filter:', group1NavItems.map(i => i.title));
    console.log('Group 3 items after filter:', group3NavItems.map(i => i.title));

    // Only show separators if both adjacent groups have items
    const showSeparator1 = hasGroup1 && hasGroup2;
    const showSeparator2 = hasGroup2 && hasGroup3;
    const showSeparator3 = hasGroup3 && hasGroup4;

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Group 1: Dashboard & Inventory */}
                {hasGroup1 && <NavMain items={group1NavItems} />}
                {showSeparator1 && <SidebarSeparator />}

                {/* Group 2: Requisition, Purchases, Deliveries, Returns */}
                {hasGroup2 && <NavMain items={group2NavItems} />}
                {showSeparator2 && <SidebarSeparator />}

                {/* Group 3: Suppliers & Users */}
                {hasGroup3 && <NavMain items={group3NavItems} />}
                {showSeparator3 && <SidebarSeparator />}

                {/* Group 4: Audit Logs & Roles & Permissions */}
                {hasGroup4 && <NavMain items={group4NavItems} />}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
