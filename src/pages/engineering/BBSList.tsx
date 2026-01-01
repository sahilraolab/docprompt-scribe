import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Plus, Search, Edit2, Trash2, BarChart3, Lock, CheckCircle, Loader2 } from 'lucide-react';
import { useBBSList, useDeleteBBS, useApproveBBS } from '@/lib/hooks/useEngineering';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency } from '@/lib/utils/format';
import type { BBS } from '@/types/engineering';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  APPROVED: 'bg-green-500/10 text-green-600 border-green-500/20',
};

export default function BBSList() {
  const navigate = useNavigate();
  const { data: bbsList = [], isLoading } = useBBSList();
  const deleteBBS = useDeleteBBS();
  const approveBBS = useApproveBBS();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [approveId, setApproveId] = useState<string | null>(null);

  const filtered = (bbsList as BBS[]).filter((b) =>
    b.code.toLowerCase().includes(search.toLowerCase()) ||
    (b.description?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = () => {
    if (deleteId) {
      deleteBBS.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
    }
  };

  const handleApprove = () => {
    if (approveId) {
      approveBBS.mutate(approveId, { onSettled: () => setApproveId(null) });
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bar Bending Schedule (BBS)"
        description="Manage BBS records for reinforcement. Approved BBS is locked."
        actions={[
          { label: 'Add BBS', onClick: () => navigate('/engineering/bbs/new'), icon: Plus }
        ]}
      />

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search BBS..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No BBS records found"
              description="Create your first BBS record"
              action={{ label: 'Add BBS', onClick: () => navigate('/engineering/bbs/new') }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((bbs) => {
                  const isLocked = bbs.status === 'APPROVED';
                  return (
                    <TableRow key={bbs.id}>
                      <TableCell className="font-mono text-sm">{bbs.code}</TableCell>
                      <TableCell>{bbs.description || '-'}</TableCell>
                      <TableCell className="text-right">{bbs.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(bbs.rate)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(bbs.amount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_COLORS[bbs.status] || ''}>
                          {isLocked && <Lock className="h-3 w-3 mr-1" />}
                          {bbs.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/engineering/bbs/${bbs.id}/edit`)}
                                disabled={isLocked}
                                title={isLocked ? 'Cannot edit approved BBS' : 'Edit BBS'}
                              >
                                <Edit2 className={`h-4 w-4 ${isLocked ? 'text-muted-foreground' : ''}`} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{isLocked ? 'Locked' : 'Edit'}</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setApproveId(String(bbs.id))}
                                disabled={isLocked || approveBBS.isPending}
                                title={isLocked ? 'Already approved' : 'Approve BBS'}
                              >
                                {approveBBS.isPending && approveId === String(bbs.id) ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className={`h-4 w-4 ${isLocked ? 'text-muted-foreground' : 'text-green-600'}`} />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{isLocked ? 'Approved' : 'Approve'}</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteId(String(bbs.id))}
                                disabled={isLocked}
                                title={isLocked ? 'Cannot delete approved BBS' : 'Delete BBS'}
                              >
                                <Trash2 className={`h-4 w-4 ${isLocked ? 'text-muted-foreground' : 'text-destructive'}`} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{isLocked ? 'Locked' : 'Delete'}</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete BBS Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Only DRAFT BBS can be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve Confirmation */}
      <AlertDialog open={!!approveId} onOpenChange={() => setApproveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve BBS?</AlertDialogTitle>
            <AlertDialogDescription>
              Once approved, this BBS record becomes locked and cannot be edited or deleted. 
              Approved BBS is used for Work Order and RA Bill quantity tracking.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove}>
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
