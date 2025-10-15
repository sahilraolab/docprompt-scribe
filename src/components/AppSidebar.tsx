import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  ShoppingCart,
  FileText,
  Package,
  Calculator,
  GitBranch,
  Settings,
  Bell,
  Users,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const mainNav = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Engineering', url: '/engineering', icon: Building2 },
  { title: 'Purchase', url: '/purchase', icon: ShoppingCart },
  { title: 'Contracts', url: '/contracts', icon: FileText },
  { title: 'Site & Inventory', url: '/site', icon: Package },
  { title: 'Accounts', url: '/accounts', icon: Calculator },
  { title: 'Workflow', url: '/workflow', icon: GitBranch },
];

const systemNav = [
  { title: 'Notifications', url: '/notifications', icon: Bell },
  { title: 'Admin', url: '/admin', icon: Users },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 shadow-sm">
      <SidebarContent className="mt-16 p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-2">Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md font-medium rounded-lg transition-all duration-200'
                          : 'hover:bg-sidebar-accent/80 rounded-lg transition-all duration-200'
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-2">System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {systemNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md font-medium rounded-lg transition-all duration-200'
                          : 'hover:bg-sidebar-accent/80 rounded-lg transition-all duration-200'
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
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
