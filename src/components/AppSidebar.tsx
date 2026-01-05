import { NavLink } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';

import { useAuth } from '@/contexts/AuthContext';
import { hasAnyPermission } from '@/lib/utils/permissions';

import {
  LayoutDashboard,
  Shield,
  Database,
  ShoppingCart,
  Boxes,
  HardHat,
  FileText,
  Building2,
  Calculator,
  GitBranch,
} from 'lucide-react';

/* =========================
   ERP MAIN NAV (FINAL)
========================= */
const MAIN_NAV = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    permissions: ['mis.view'],
  },
  {
    title: 'Admin',
    url: '/admin',
    icon: Shield,
    permissions: ['admin.view'],
  },
  {
    title: 'Masters',
    url: '/masters',
    icon: Database,
    permissions: ['masters.view'],
  },
  {
    title: 'Purchase',
    url: '/purchase',
    icon: ShoppingCart,
    permissions: ['purchase.view'],
  },

  {
    title: 'Supplier',
    url: '/supplier',
    icon: FileText,
    permissions: ['supplier.view'],
  },

  {
    title: 'Inventory',
    url: '/inventory',
    icon: Boxes,
    permissions: ['inventory.view'],
  },
  {
    title: 'Site',
    url: '/site',
    icon: HardHat,
    permissions: ['site.view'],
  },
  {
    title: 'Contracts',
    url: '/contracts',
    icon: FileText,
    permissions: ['contracts.view'],
  },
  {
    title: 'Engineering',
    url: '/engineering',
    icon: Building2,
    permissions: ['engineering.view'],
  },
  {
    title: 'Accounts',
    url: '/accounts',
    icon: Calculator,
    permissions: ['accounts.view'],
  },
  {
    title: 'Workflow',
    url: '/workflow',
    icon: GitBranch,
    permissions: ['workflow.view'],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { user } = useAuth();

  const permissions = user?.permissions ?? [];

  return (
    <Sidebar collapsible="icon" className="border-r">
      {/* BRAND */}
      <SidebarHeader className="h-16 border-b flex items-center px-4 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg border flex items-center justify-center">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-sm">Construction ERP</span>
          )}
        </div>
      </SidebarHeader>

      {/* NAV */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {MAIN_NAV.filter(item =>
                hasAnyPermission(permissions, item.permissions)
              ).map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : ''
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
