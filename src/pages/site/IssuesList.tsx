import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIssues, useApproveIssue } from '@/lib/hooks/useSite';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { formatDate } from '@/lib/utils/format';
import { Plus, Search, Send, Loader2, MoreHorizontal, Eye, Edit, CheckCircle } from 'lucide-react';
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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [confirmApprove, setConfirmApprove] = useState<string | null>(null);
  
  const { data: issues = [], isLoading } = useIssues();
  const { mutateAsync: approveIssue, isPending: isApproving } = useApproveIssue();

  const filteredIssues = issues.filter((issue: any) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      issue.issueNo?.toLowerCase().includes(query) ||
      issue.projectId?.name?.toLowerCase().includes(query) ||
      issue.issuedTo?.toLowerCase().includes(query);
    
    const matchesStatus = statusFilter === 'all' || 
      issue.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async () => {
    if (!confirmApprove) return;
    try {
      await approveIssue({ id: confirmApprove });
      setConfirmApprove(null);
    } catch (error) {
      console.error('Failed to approve issue:', error);
    }
  };

  const canApprove = (status: string) => {
    const s = status?.toLowerCase();
    return s === 'draft' || s === 'pending' || s === 'created';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Material Issues</h1>
          <p className="text-muted-foreground">Track material issued from store to project sites</p>
        </div>
        <Button onClick={() => navigate('/site/issues/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Issue
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by issue no, project, or recipient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredIssues.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Issue No</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Issued To</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIssues.map((issue: any) => (
                    <TableRow key={issue._id || issue.id}>
                      <TableCell className="font-medium">{issue.issueNo}</TableCell>
                      <TableCell>{issue.projectId?.name || 'N/A'}</TableCell>
                      <TableCell>{issue.issuedTo}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{issue.purpose}</TableCell>
                      <TableCell>{issue.items?.length || 0} items</TableCell>
                      <TableCell>{formatDate(issue.issueDate)}</TableCell>
                      <TableCell>
                        <StatusBadge status={issue.status || 'Pending'} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/site/issues/${issue._id || issue.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            {canApprove(issue.status) && (
                              <>
                                <DropdownMenuItem onClick={() => navigate(`/site/issues/${issue._id || issue.id}`)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => setConfirmApprove(issue._id || issue.id)}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve & Issue
                                </DropdownMenuItem>
                              </>
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
                  ? "No issues match your filters"
                  : "Issue materials from store to project sites"
              }
              action={
                !searchQuery && statusFilter === 'all'
                  ? {
                      label: "Create Issue",
                      onClick: () => navigate('/site/issues/new'),
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
        title="Approve & Issue Material"
        description="This will approve the issue, deduct stock levels, and lock it from further edits. Continue?"
        confirmText="Approve & Issue"
        onConfirm={handleApprove}
      />
    </div>
  );
}