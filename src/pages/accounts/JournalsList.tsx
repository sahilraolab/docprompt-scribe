import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Plus, Search, BookOpen, Loader2, MoreHorizontal, Eye, Edit, CheckCircle, XCircle, FileCheck, Lock } from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useJournals, useApproveJournal, useRejectJournal, usePostJournal, useDeleteJournal } from '@/lib/hooks/useAccounts';

export default function JournalsList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [confirmApprove, setConfirmApprove] = useState<string | null>(null);
  const [confirmReject, setConfirmReject] = useState<string | null>(null);
  const [confirmPost, setConfirmPost] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: journals = [], isLoading } = useJournals();
  const { mutateAsync: approveJournal } = useApproveJournal();
  const { mutateAsync: rejectJournal } = useRejectJournal();
  const { mutateAsync: postJournal } = usePostJournal();
  const { mutateAsync: deleteJournal } = useDeleteJournal();

  const filteredJournals = journals.filter((journal: any) => {
    const matchesSearch = 
      journal.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      journal.narration?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      journal.status?.toLowerCase() === statusFilter.toLowerCase();
    
    const matchesType = typeFilter === 'all' || journal.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleApprove = async () => {
    if (!confirmApprove) return;
    try {
      await approveJournal({ id: confirmApprove });
      setConfirmApprove(null);
    } catch (error) {
      console.error('Failed to approve journal:', error);
    }
  };

  const handleReject = async () => {
    if (!confirmReject) return;
    try {
      await rejectJournal({ id: confirmReject });
      setConfirmReject(null);
    } catch (error) {
      console.error('Failed to reject journal:', error);
    }
  };

  const handlePost = async () => {
    if (!confirmPost) return;
    try {
      await postJournal(confirmPost);
      setConfirmPost(null);
    } catch (error) {
      console.error('Failed to post journal:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteJournal(confirmDelete);
      setConfirmDelete(null);
    } catch (error) {
      console.error('Failed to delete journal:', error);
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Payment':
        return 'bg-red-100 text-red-800';
      case 'Receipt':
        return 'bg-green-100 text-green-800';
      case 'Journal':
      case 'General':
        return 'bg-blue-100 text-blue-800';
      case 'Contra':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canApprove = (status: string) => {
    const s = status?.toLowerCase();
    return s === 'draft' || s === 'pending';
  };

  const canPost = (status: string) => {
    const s = status?.toLowerCase();
    return s === 'approved';
  };

  const isLocked = (status: string) => {
    const s = status?.toLowerCase();
    return s === 'posted' || s === 'cancelled';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Stats
  const draftCount = journals.filter((j: any) => j.status?.toLowerCase() === 'draft').length;
  const approvedCount = journals.filter((j: any) => j.status?.toLowerCase() === 'approved').length;
  const postedCount = journals.filter((j: any) => j.status?.toLowerCase() === 'posted').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Journal Entries (Vouchers)</h1>
          <p className="text-muted-foreground">Double-entry accounting journals with approval workflow</p>
        </div>
        <Button onClick={() => navigate('/accounts/journals/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Voucher
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Draft</p>
          <p className="text-2xl font-bold text-amber-600">{draftCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Approved (Pending Post)</p>
          <p className="text-2xl font-bold text-blue-600">{approvedCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Posted</p>
          <p className="text-2xl font-bold text-green-600">{postedCount}</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by journal no or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="posted">Posted</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Payment">Payment</SelectItem>
                <SelectItem value="Receipt">Receipt</SelectItem>
                <SelectItem value="Contra">Contra</SelectItem>
                <SelectItem value="Journal">Journal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredJournals.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Voucher No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Narration</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJournals.map((journal: any) => (
                    <TableRow key={journal.id || journal._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {journal.code}
                          {isLocked(journal.status) && (
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(journal.date)}</TableCell>
                      <TableCell>
                        <Badge className={getTypeBadgeColor(journal.type)} variant="secondary">
                          {journal.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{journal.narration || '-'}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(journal.totalDebit)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(journal.totalCredit)}
                      </TableCell>
                      <TableCell>{journal.projectName || '-'}</TableCell>
                      <TableCell>
                        <StatusBadge status={journal.status} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/accounts/journals/${journal.id || journal._id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            
                            {canApprove(journal.status) && (
                              <>
                                <DropdownMenuItem onClick={() => navigate(`/accounts/journals/${journal.id || journal._id}`)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => setConfirmApprove(journal.id || journal._id)}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => setConfirmReject(journal.id || journal._id)}
                                  className="text-red-600"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => setConfirmDelete(journal.id || journal._id)}
                                  className="text-destructive"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                            
                            {canPost(journal.status) && (
                              <DropdownMenuItem 
                                onClick={() => setConfirmPost(journal.id || journal._id)}
                                className="text-blue-600"
                              >
                                <FileCheck className="h-4 w-4 mr-2" />
                                Post to Ledger
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
              icon={BookOpen}
              title="No journal entries found"
              description={
                searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? "No journals match your filters"
                  : "Create journal entries for accounting transactions"
              }
              action={
                !searchQuery && statusFilter === 'all' && typeFilter === 'all'
                  ? {
                      label: "Create Voucher",
                      onClick: () => navigate('/accounts/journals/new'),
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
        title="Approve Voucher"
        description="This will approve the voucher and make it ready for posting. Continue?"
        confirmText="Approve"
        onConfirm={handleApprove}
      />

      <ConfirmDialog
        open={!!confirmReject}
        onOpenChange={() => setConfirmReject(null)}
        title="Reject Voucher"
        description="This will reject the voucher and mark it as cancelled. Continue?"
        confirmText="Reject"
        onConfirm={handleReject}
      />

      <ConfirmDialog
        open={!!confirmPost}
        onOpenChange={() => setConfirmPost(null)}
        title="Post to Ledger"
        description="This will post the voucher to ledger accounts and lock it from further edits. This action cannot be undone. Continue?"
        confirmText="Post"
        onConfirm={handlePost}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={() => setConfirmDelete(null)}
        title="Delete Voucher"
        description="Are you sure you want to delete this voucher? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}