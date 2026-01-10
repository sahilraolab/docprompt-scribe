/**
 * Material Issues List Page
 * Aligned with backend: GET /inventory/issue, PUT /inventory/issue/:id/cancel
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIssues, useCancelIssue } from '@/lib/hooks/useInventory';
import { useProjects } from '@/lib/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SearchableSelect } from '@/components/SearchableSelect';
import { formatDate } from '@/lib/utils/format';
import { Plus, Search, Send, Loader2, MoreHorizontal, Eye, XCircle } from 'lucide-react';
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

export default function IssuesList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [confirmCancel, setConfirmCancel] = useState<number | null>(null);

  const { data: projects = [] } = useProjects();
  const { data: issues = [], isLoading } = useIssues(
    selectedProjectId ? { projectId: selectedProjectId } : undefined,
    { enabled: !!selectedProjectId }
  );
  const { mutateAsync: cancelIssue, isPending: isCancelling } = useCancelIssue();

  const filteredIssues = issues.filter((issue: any) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      issue.issueNo?.toLowerCase().includes(query) ||
      issue.purpose?.toLowerCase().includes(query) ||
      issue.issuedTo?.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCancel = async () => {
    if (!confirmCancel) return;
    try {
      await cancelIssue(confirmCancel);
      setConfirmCancel(null);
    } catch (error) {
      console.error('Failed to cancel issue:', error);
    }
  };

  const canCancel = (status: string) => {
    return status === 'APPROVED';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Material Issues</h1>
          <p className="text-muted-foreground">Issue materials from stock for site consumption</p>
        </div>
        <Button onClick={() => navigate('/inventory/issues/new')} disabled={!selectedProjectId}>
          <Plus className="h-4 w-4 mr-2" />
          New Issue
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
                placeholder="Select project to view issues..."
              />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by issue no, purpose, or recipient..."
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
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedProjectId ? (
            <EmptyState
              icon={Send}
              title="Select a Project"
              description="Choose a project to view its material issues"
            />
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredIssues.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Issue No</TableHead>
                    <TableHead>From Location</TableHead>
                    <TableHead>Issued To</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Lines</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIssues.map((issue: any) => (
                    <TableRow key={issue.id} className={issue.status === 'CANCELLED' ? 'opacity-60' : ''}>
                      <TableCell className="font-medium">{issue.issueNo}</TableCell>
                      <TableCell>{issue.fromLocationName || issue.fromLocationId}</TableCell>
                      <TableCell>{issue.issuedTo || 'N/A'}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{issue.purpose}</TableCell>
                      <TableCell>{issue.lines?.length || 0} items</TableCell>
                      <TableCell>{formatDate(issue.issueDate || issue.createdAt)}</TableCell>
                      <TableCell>
                        <StatusBadge status={issue.status} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/inventory/issues/${issue.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {canCancel(issue.status) && (
                              <DropdownMenuItem
                                onClick={() => setConfirmCancel(issue.id)}
                                className="text-destructive"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel Issue
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
              icon={Send}
              title="No issues found"
              description={
                searchQuery || statusFilter !== 'all'
                  ? 'No issues match your filters'
                  : 'Create material issues to consume stock'
              }
              action={
                !searchQuery && statusFilter === 'all'
                  ? {
                      label: 'Create Issue',
                      onClick: () => navigate('/inventory/issues/new'),
                    }
                  : undefined
              }
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!confirmCancel}
        onOpenChange={() => setConfirmCancel(null)}
        title="Cancel Material Issue"
        description="This will cancel the issue and automatically reverse the stock (add back the issued quantities). This action cannot be undone."
        confirmText="Cancel Issue"
        onConfirm={handleCancel}
      />
    </div>
  );
}
