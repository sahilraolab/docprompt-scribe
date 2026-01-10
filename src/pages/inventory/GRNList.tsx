/**
 * GRN List Page
 * Aligned with backend: GET /inventory/grn, PUT /inventory/grn/:id/approve
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGRNs, useApproveGRN } from '@/lib/hooks/useInventory';
import { useProjects } from '@/lib/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SearchableSelect } from '@/components/SearchableSelect';
import { formatDate } from '@/lib/utils/format';
import { Plus, Search, Package, Loader2, MoreHorizontal, Eye, FileCheck } from 'lucide-react';
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

export default function GRNList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [confirmApprove, setConfirmApprove] = useState<number | null>(null);

  const { data: projects = [] } = useProjects();
  const { data: grns = [], isLoading } = useGRNs(
    selectedProjectId ? { projectId: selectedProjectId } : undefined,
    { enabled: !!selectedProjectId }
  );
  const { mutateAsync: approveGRN, isPending: isApproving } = useApproveGRN();

  const filteredGRNs = grns.filter((grn: any) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      grn.grnNo?.toLowerCase().includes(query) ||
      grn.poNo?.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'all' || grn.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleApprove = async () => {
    if (!confirmApprove) return;
    try {
      await approveGRN(confirmApprove);
      setConfirmApprove(null);
    } catch (error) {
      console.error('Failed to approve GRN:', error);
    }
  };

  const canApprove = (status: string) => {
    return status === 'QC_PENDING' || status === 'DRAFT';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Goods Receipt Notes (GRN)</h1>
          <p className="text-muted-foreground">Receive materials from approved Purchase Orders</p>
        </div>
        <Button onClick={() => navigate('/inventory/grn/new')} disabled={!selectedProjectId}>
          <Plus className="h-4 w-4 mr-2" />
          New GRN
        </Button>
      </div>

      {/* Project Selector */}
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
                placeholder="Select project to view GRNs..."
              />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by GRN no or PO..."
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
                <SelectItem value="QC_PENDING">QC Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="PARTIAL_APPROVED">Partial Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedProjectId ? (
            <EmptyState
              icon={Package}
              title="Select a Project"
              description="Choose a project to view its GRNs"
            />
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredGRNs.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>GRN No</TableHead>
                    <TableHead>PO No</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Lines</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Billed</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGRNs.map((grn: any) => (
                    <TableRow key={grn.id}>
                      <TableCell className="font-medium">{grn.grnNo}</TableCell>
                      <TableCell>{grn.poNo || grn.poId}</TableCell>
                      <TableCell>{grn.locationName || grn.locationId}</TableCell>
                      <TableCell>{grn.lines?.length || 0} items</TableCell>
                      <TableCell>{formatDate(grn.grnDate || grn.createdAt)}</TableCell>
                      <TableCell>
                        <StatusBadge status={grn.status} />
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          grn.billed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {grn.billed ? 'Yes' : 'No'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/inventory/grn/${grn.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {canApprove(grn.status) && (
                              <DropdownMenuItem
                                onClick={() => setConfirmApprove(grn.id)}
                                className="text-green-600"
                              >
                                <FileCheck className="h-4 w-4 mr-2" />
                                Approve GRN
                              </DropdownMenuItem>
                            )}
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
              icon={Package}
              title="No GRNs found"
              description={
                searchQuery || statusFilter !== 'all'
                  ? 'No GRNs match your filters'
                  : 'Create GRNs to receive materials from approved POs'
              }
              action={
                !searchQuery && statusFilter === 'all'
                  ? {
                      label: 'Create GRN',
                      onClick: () => navigate('/inventory/grn/new'),
                    }
                  : undefined
              }
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!confirmApprove}
        onOpenChange={() => setConfirmApprove(null)}
        title="Approve GRN"
        description="This will approve the GRN, update stock levels, and create ledger entries. This action cannot be undone."
        confirmText="Approve GRN"
        onConfirm={handleApprove}
      />
    </div>
  );
}
