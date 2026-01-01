import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRFQs, useCloseRFQ, useDeleteRFQ } from '@/lib/hooks/usePurchaseBackend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatDate } from '@/lib/utils/format';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Plus, Search, Send, Loader2, XCircle, Lock, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

export default function RFQList() {
  const navigate = useNavigate();
  const { data: rfqs = [], isLoading } = useRFQs();
  const closeRFQ = useCloseRFQ();
  const deleteRFQ = useDeleteRFQ();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [closeConfirm, setCloseConfirm] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const normalizedRFQs = rfqs.map((rfq: any) => ({
    id: rfq._id || rfq.id,
    rfqNo: rfq.rfqNo || rfq.code,
    requisitionCode: rfq.requisitionId?.code || 'N/A',
    supplierName: rfq.supplierId?.name || 'N/A',
    rfqDate: rfq.rfqDate || rfq.createdAt,
    closingDate: rfq.closingDate,
    status: rfq.status || 'OPEN',
  }));

  const filteredRFQs = normalizedRFQs.filter((rfq: any) => {
    const matchesSearch =
      rfq.rfqNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfq.supplierName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfq.requisitionCode?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rfq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleClose = (id: string) => {
    closeRFQ.mutate(id, {
      onSuccess: () => setCloseConfirm(null),
    });
  };

  const handleDelete = (id: string) => {
    deleteRFQ.mutate(id, {
      onSuccess: () => setDeleteConfirm(null),
    });
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
          <h1 className="text-3xl font-bold">Request for Quotations</h1>
          <p className="text-muted-foreground">Send RFQs to suppliers for approved MRs</p>
        </div>
        <Button onClick={() => navigate('/purchase/rfqs/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New RFQ
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by RFQ No, MR, or supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRFQs.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RFQ No</TableHead>
                    <TableHead>MR Code</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>RFQ Date</TableHead>
                    <TableHead>Closing Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRFQs.map((rfq: any) => (
                    <TableRow key={rfq.id}>
                      <TableCell className="font-medium">{rfq.rfqNo}</TableCell>
                      <TableCell>{rfq.requisitionCode}</TableCell>
                      <TableCell>{rfq.supplierName}</TableCell>
                      <TableCell>{formatDate(rfq.rfqDate)}</TableCell>
                      <TableCell>{rfq.closingDate ? formatDate(rfq.closingDate) : '-'}</TableCell>
                      <TableCell>
                        <StatusBadge status={rfq.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {rfq.status === 'OPEN' && (
                              <DropdownMenuItem onClick={() => setCloseConfirm(rfq.id)}>
                                <Lock className="h-4 w-4 mr-2" />
                                Close RFQ
                              </DropdownMenuItem>
                            )}
                            {rfq.status === 'OPEN' && (
                              <DropdownMenuItem onClick={() => setDeleteConfirm(rfq.id)} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
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
              title="No RFQs found"
              description="Create RFQs to request quotations from suppliers"
              action={{
                label: 'Create RFQ',
                onClick: () => navigate('/purchase/rfqs/new'),
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Close Confirmation */}
      <ConfirmDialog
        open={!!closeConfirm}
        onOpenChange={() => setCloseConfirm(null)}
        title="Close RFQ"
        description="Once closed, no more quotations can be received for this RFQ. Continue?"
        confirmText="Close RFQ"
        onConfirm={() => closeConfirm && handleClose(closeConfirm)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        title="Delete RFQ"
        description="This will permanently delete the RFQ. This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
      />
    </div>
  );
}
