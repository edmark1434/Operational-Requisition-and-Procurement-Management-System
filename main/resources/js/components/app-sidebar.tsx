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
import { dashboard, requisitions, inventory, purchases, suppliers, returns, audit, users, roles } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, NotepadTextIcon, Package, ShoppingCart, Contact, SquareArrowDownIcon, LucideLogs, User, Shield } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Requisitions',
        href: requisitions(),
        icon: NotepadTextIcon,
    },
    {
        title: 'Inventory',
        href: inventory(),
        icon: Package,
    },
    {
        title: 'Purchases',
        href: purchases(),
        icon: ShoppingCart,
    },
    {
        title: 'Suppliers',
        href: suppliers(),
        icon: Contact,
    },
    {
        title: 'Returns',
        href: returns(),
        icon: SquareArrowDownIcon,
    },
    {
        title: 'Audit Logs',
        href: audit(),
        icon: LucideLogs,
    },
    {
        title: 'Users',
        href: users(),
        icon: User,
    },
    {
        title: 'Roles',
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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
