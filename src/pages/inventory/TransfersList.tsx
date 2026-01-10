/**
 * Stock Transfers List Page
 * Aligned with backend: GET /inventory/transfer
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransfers } from '@/lib/hooks/useInventory';
import { useProjects } from '@/lib/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { SearchableSelect } from '@/components/SearchableSelect';
import { formatDate } from '@/lib/utils/format';
import { Plus, Search, ArrowRightLeft, Loader2, MoreHorizontal, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TransfersList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: projects = [] } = useProjects();
  const { data: transfers = [], isLoading } = useTransfers(
    selectedProjectId ? { projectId: selectedProjectId } : undefined,
    { enabled: !!selectedProjectId }
  );

  const filteredTransfers = transfers.filter((transfer: any) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      transfer.transferNo?.toLowerCase().includes(query) ||
      transfer.remarks?.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stock Transfers</h1>
          <p className="text-muted-foreground">Transfer materials between locations within a project</p>
        </div>
        <Button onClick={() => navigate('/inventory/transfers/new')} disabled={!selectedProjectId}>
          <Plus className="h-4 w-4 mr-2" />
          New Transfer
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchableSelect
                options={projects.map((p: any) => ({
                  value: p.id || p._id,
                  label: `${p.name} (${p.code || 'N/A'})`,
                }))}
                value={selectedProjectId?.toString() || ''}
                onChange={(val) => setSelectedProjectId(val ? Number(val) : null)}
                placeholder="Select project to view transfers..."
              />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by transfer no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                disabled={!selectedProjectId}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter} disabled={!selectedProjectId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedProjectId ? (
            <EmptyState
              icon={ArrowRightLeft}
              title="Select a Project"
              description="Choose a project to view its stock transfers"
            />
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTransfers.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transfer No</TableHead>
                    <TableHead>From Location</TableHead>
                    <TableHead>To Location</TableHead>
                    <TableHead>Lines</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransfers.map((transfer: any) => (
                    <TableRow key={transfer.id}>
                      <TableCell className="font-medium">{transfer.transferNo}</TableCell>
                      <TableCell>{transfer.fromLocationName || transfer.fromLocationId}</TableCell>
                      <TableCell>{transfer.toLocationName || transfer.toLocationId}</TableCell>
                      <TableCell>{transfer.lines?.length || 0} items</TableCell>
                      <TableCell>{transfer.vehicleNo || '-'}</TableCell>
                      <TableCell>{formatDate(transfer.transferDate || transfer.createdAt)}</TableCell>
                      <TableCell>
                        <StatusBadge status={transfer.status} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/inventory/transfers/${transfer.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={ArrowRightLeft}
              title="No transfers found"
              description={
                searchQuery || statusFilter !== 'all'
                  ? 'No transfers match your filters'
                  : 'Create transfers to move stock between locations'
              }
              action={
                !searchQuery && statusFilter === 'all'
                  ? {
                      label: 'Create Transfer',
                      onClick: () => navigate('/inventory/transfers/new'),
                    }
                  : undefined
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
