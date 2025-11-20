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
import { dashboard, requisitions, inventory, purchases, suppliers, delivery, returns, audit, users, roles } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, NotepadTextIcon, Package, ShoppingCart, Contact, SquareArrowDownIcon, LucideLogs, User, Shield, Truck } from 'lucide-react';
import AppLogo from './app-logo';

// Group 1: Dashboard & Inventory
const group1NavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Inventory',
        href: inventory(),
        icon: Package,
    },
];

// Group 2: Requisition, Purchases, Deliveries, Returns
const group2NavItems: NavItem[] = [
    {
        title: 'Requisitions',
        href: requisitions(),
        icon: NotepadTextIcon,
    },
    {
        title: 'Purchase Orders',
        href: purchases(),
        icon: ShoppingCart,
    },
    {
        title: 'Deliveries',
        href: delivery(),
        icon: Truck,
    },
    {
        title: 'Returns',
        href: returns(),
        icon: SquareArrowDownIcon,
    },
];

// Group 3: Suppliers & Users
const group3NavItems: NavItem[] = [
    {
        title: 'Suppliers',
        href: suppliers(),
        icon: Contact,
    },
    {
        title: 'Users',
        href: users(),
        icon: User,
    },
];

// Group 4: Audit Logs & Roles & Permissions
const group4NavItems: NavItem[] = [
    {
        title: 'Audit Logs',
        href: audit(),
        icon: LucideLogs,
    },
    {
        title: 'Roles & Permissions',
        href: roles(),
        icon: Shield,
    },
];

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
                <NavMain items={group1NavItems} />

                {/* First Separator */}
                <SidebarSeparator />

                {/* Group 2: Requisition, Purchases, Deliveries, Returns */}
                <NavMain items={group2NavItems} />

                {/* Second Separator */}
                <SidebarSeparator />

                {/* Group 3: Suppliers & Users */}
                <NavMain items={group3NavItems} />

                {/* Third Separator */}
                <SidebarSeparator />

                {/* Group 4: Audit Logs & Roles & Permissions */}
                <NavMain items={group4NavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
