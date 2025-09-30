import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/EmptyState';
import { formatDateTime } from '@/lib/utils/format';
import { Search, Shield } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AuditTrailList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  // Mock data
  const auditLogs = [
    {
      id: '1',
      timestamp: '2024-01-20T14:30:00',
      user: 'John Doe',
      action: 'Create',
      module: 'Purchase',
      entity: 'Material Requisition',
      entityId: 'MR-2024-001',
      ipAddress: '192.168.1.10',
      details: 'Created new MR for Green Valley project',
    },
    {
      id: '2',
      timestamp: '2024-01-20T15:45:00',
      user: 'Jane Smith',
      action: 'Approve',
      module: 'Purchase',
      entity: 'Purchase Order',
      entityId: 'PO-2024-001',
      ipAddress: '192.168.1.15',
      details: 'Approved PO for ABC Suppliers',
    },
    {
      id: '3',
      timestamp: '2024-01-20T16:20:00',
      user: 'Mike Johnson',
      action: 'Update',
      module: 'Contracts',
      entity: 'Work Order',
      entityId: 'WO-2024-001',
      ipAddress: '192.168.1.12',
      details: 'Updated WO amount and delivery date',
    },
    {
      id: '4',
      timestamp: '2024-01-20T17:10:00',
      user: 'Sarah Lee',
      action: 'Delete',
      module: 'Site',
      entity: 'Stock Item',
      entityId: 'ITEM-045',
      ipAddress: '192.168.1.20',
      details: 'Deleted obsolete stock item',
    },
    {
      id: '5',
      timestamp: '2024-01-20T18:00:00',
      user: 'Admin User',
      action: 'Create',
      module: 'Admin',
      entity: 'User',
      entityId: 'USR-025',
      ipAddress: '192.168.1.5',
      details: 'Created new user account for contractor',
    },
  ];

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'Create':
        return 'bg-green-100 text-green-800';
      case 'Update':
        return 'bg-blue-100 text-blue-800';
      case 'Delete':
        return 'bg-red-100 text-red-800';
      case 'Approve':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Trail</h1>
        <p className="text-muted-foreground">Track all system activities and changes</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, entity, or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="Create">Create</SelectItem>
                <SelectItem value="Update">Update</SelectItem>
                <SelectItem value="Delete">Delete</SelectItem>
                <SelectItem value="Approve">Approve</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLogs.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Entity ID</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        {formatDateTime(log.timestamp)}
                      </TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>
                        <Badge className={getActionBadgeColor(log.action)} variant="secondary">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.module}</TableCell>
                      <TableCell>{log.entity}</TableCell>
                      <TableCell className="font-mono text-sm">{log.entityId}</TableCell>
                      <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                      <TableCell className="max-w-md truncate">{log.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={Shield}
              title="No audit logs found"
              description={
                searchQuery || actionFilter !== 'all'
                  ? "No logs match your filters"
                  : "System activities will be logged here"
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
