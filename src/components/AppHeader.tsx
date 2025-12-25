import { Bell, User, LogOut, Settings as SettingsIcon, Building2 } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function AppHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Get role display name
  const getRoleName = () => {
    if (!user?.role) return 'User';
    return typeof user.role === 'object' ? user.role.name : user.role;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b bg-background/80 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <div>
            <h1 className="text-sm font-semibold">Construction ERP</h1>
            <p className="text-[10px] text-muted-foreground">
              Enterprise Resource Planning
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="hidden md:inline text-sm font-medium">
                {user?.name}
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="space-y-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <Badge variant="secondary" className="text-xs">
                  {getRoleName()}
                </Badge>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
