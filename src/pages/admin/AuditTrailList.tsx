import { useState, useMemo } from 'react';
import { useAuditLogs } from '@/lib/hooks/useAdminModule';
import { formatAction, formatModule } from '@/lib/constants/adminConstants';
import { formatDateTime, formatRelativeTime } from '@/lib/utils/format';

import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Search,
  Activity,
  Loader2,
  Clock,
  User,
  FileText,
  Filter,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  LogIn,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Action icon mapping
const ActionIcons: Record<string, any> = {
  CREATE: Plus,
  CREATE_USER: Plus,
  CREATE_ROLE: Plus,
  UPDATE: Edit,
  UPDATE_USER: Edit,
  UPDATE_ROLE: Edit,
  ASSIGN_PERMISSIONS: Edit,
  DELETE: Trash2,
  DELETE_USER: Trash2,
  VIEW: Eye,
  EXPORT: Download,
  IMPORT: Upload,
  APPROVE: CheckCircle,
  REJECT: XCircle,
  LOGIN: LogIn,
  LOGOUT: LogOut,
};

// Action color mapping
const ActionColors: Record<string, string> = {
  CREATE: 'bg-success/10 text-success border-success/20',
  CREATE_USER: 'bg-success/10 text-success border-success/20',
  CREATE_ROLE: 'bg-success/10 text-success border-success/20',
  UPDATE: 'bg-info/10 text-info border-info/20',
  UPDATE_USER: 'bg-info/10 text-info border-info/20',
  UPDATE_ROLE: 'bg-info/10 text-info border-info/20',
  ASSIGN_PERMISSIONS: 'bg-info/10 text-info border-info/20',
  DELETE: 'bg-destructive/10 text-destructive border-destructive/20',
  DELETE_USER: 'bg-destructive/10 text-destructive border-destructive/20',
  VIEW: 'bg-muted text-muted-foreground border-border',
  EXPORT: 'bg-warning/10 text-warning border-warning/20',
  IMPORT: 'bg-warning/10 text-warning border-warning/20',
  APPROVE: 'bg-success/10 text-success border-success/20',
  REJECT: 'bg-destructive/10 text-destructive border-destructive/20',
  LOGIN: 'bg-primary/10 text-primary border-primary/20',
  LOGOUT: 'bg-muted text-muted-foreground border-border',
};

export default function AuditTrailList() {
  const { data: auditLogs = [], isLoading, refetch, isFetching } = useAuditLogs();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');

  // Get unique actions and modules for filters
  const { uniqueActions, uniqueModules } = useMemo(() => {
    const actions = new Set<string>();
    const modules = new Set<string>();
    auditLogs.forEach(log => {
      if (log.action) actions.add(log.action);
      if (log.module) modules.add(log.module);
    });
    return {
      uniqueActions: Array.from(actions).sort(),
      uniqueModules: Array.from(modules).sort(),
    };
  }, [auditLogs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesSearch =
        log.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.module?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(log.recordId || '').includes(searchQuery);

      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;

      return matchesSearch && matchesAction && matchesModule;
    });
  }, [auditLogs, searchQuery, actionFilter, moduleFilter]);

  // Get initials
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get action icon
  const getActionIcon = (action: string) => {
    const Icon = ActionIcons[action] || Activity;
    return Icon;
  };

  // Get action color
  const getActionColor = (action: string) => {
    return ActionColors[action] || 'bg-muted text-muted-foreground border-border';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Activity Logs</h1>
          <p className="text-muted-foreground mt-1">
            Monitor all system activities and user actions
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => refetch()} 
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Activities</p>
                <p className="text-2xl font-bold">{auditLogs.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique Users</p>
                <p className="text-2xl font-bold">
                  {new Set(auditLogs.map(l => l.userId)).size}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center">
                <User className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Modules Tracked</p>
                <p className="text-2xl font-bold">{uniqueModules.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, action, module, or record ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActions.map(action => (
                    <SelectItem key={action} value={action}>
                      {formatAction(action)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger className="w-[180px]">
                  <FileText className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by module" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="all">All Modules</SelectItem>
                  {uniqueModules.map(module => (
                    <SelectItem key={module} value={module}>
                      {formatModule(module)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredLogs.length > 0 ? (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold w-[250px]">User</TableHead>
                    <TableHead className="font-semibold">Activity</TableHead>
                    <TableHead className="font-semibold">Module</TableHead>
                    <TableHead className="font-semibold">Record</TableHead>
                    <TableHead className="font-semibold text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredLogs.map((log, index) => {
                    const ActionIcon = getActionIcon(log.action);
                    return (
                      <TableRow 
                        key={log.id} 
                        className="hover:bg-muted/30 transition-colors"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {getInitials(log.user?.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{log.user?.name || 'Unknown User'}</p>
                              <p className="text-xs text-muted-foreground">{log.user?.email || '—'}</p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={`gap-1.5 ${getActionColor(log.action)}`}
                            >
                              <ActionIcon className="h-3 w-3" />
                              {formatAction(log.action)}
                            </Badge>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="secondary">
                            {formatModule(log.module)}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {log.recordId ? (
                            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                              #{log.recordId}
                            </code>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground cursor-help">
                                <Clock className="h-3 w-3" />
                                {formatRelativeTime(log.createdAt)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{formatDateTime(log.createdAt)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <Activity className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No activity logs found</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {searchQuery || actionFilter !== 'all' || moduleFilter !== 'all'
                  ? 'No logs match your current filters'
                  : 'System activities will appear here as users interact with the platform'
                }
              </p>
              {(searchQuery || actionFilter !== 'all' || moduleFilter !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setActionFilter('all');
                    setModuleFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}

          {/* Results count */}
          {filteredLogs.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Showing {filteredLogs.length} of {auditLogs.length} activities
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
