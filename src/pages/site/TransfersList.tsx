import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransfers, useApproveTransfer, useReceiveTransfer } from '@/lib/hooks/useSite';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { formatDate } from '@/lib/utils/format';
import { Plus, Search, ArrowRightLeft, Loader2, MoreHorizontal, Eye, Edit, CheckCircle, Package } from 'lucide-react';
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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [confirmApprove, setConfirmApprove] = useState<string | null>(null);
  const [confirmReceive, setConfirmReceive] = useState<string | null>(null);
  
  const { data: transfers = [], isLoading } = useTransfers();
  const { mutateAsync: approveTransfer, isPending: isApproving } = useApproveTransfer();
  const { mutateAsync: receiveTransfer, isPending: isReceiving } = useReceiveTransfer();

  const filteredTransfers = transfers.filter((transfer: any) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      transfer.transferNo?.toLowerCase().includes(query) ||
      transfer.fromProjectId?.name?.toLowerCase().includes(query) ||
      transfer.toProjectId?.name?.toLowerCase().includes(query);
    
    const matchesStatus = statusFilter === 'all' || 
      transfer.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async () => {
    if (!confirmApprove) return;
    try {
      await approveTransfer({ id: confirmApprove });
      setConfirmApprove(null);
    } catch (error) {
      console.error('Failed to approve transfer:', error);
    }
  };

  const handleReceive = async () => {
    if (!confirmReceive) return;
    try {
      await receiveTransfer(confirmReceive);
      setConfirmReceive(null);
    } catch (error) {
      console.error('Failed to receive transfer:', error);
    }
  };

  const canApprove = (status: string) => {
    const s = status?.toLowerCase();
    return s === 'draft' || s === 'pending' || s === 'created';
  };

  const canReceive = (status: string) => {
    const s = status?.toLowerCase();
    return s === 'approved' || s === 'in_transit' || s === 'intransit';
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
          <h1 className="text-3xl font-bold">Stock Transfers</h1>
          <p className="text-muted-foreground">Transfer materials between project sites</p>
        </div>
        <Button onClick={() => navigate('/site/transfers/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Transfer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by transfer no or project name..."
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
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransfers.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transfer No</TableHead>
                    <TableHead>From Project</TableHead>
                    <TableHead>To Project</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransfers.map((transfer: any) => (
                    <TableRow key={transfer._id || transfer.id}>
                      <TableCell className="font-medium">{transfer.transferNo}</TableCell>
                      <TableCell>{transfer.fromProjectId?.name || 'N/A'}</TableCell>
                      <TableCell>{transfer.toProjectId?.name || 'N/A'}</TableCell>
                      <TableCell>{transfer.items?.length || 0} items</TableCell>
                      <TableCell>{formatDate(transfer.transferDate)}</TableCell>
                      <TableCell>
                        <StatusBadge status={transfer.status || 'Pending'} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/site/transfers/${transfer._id || transfer.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            {canApprove(transfer.status) && (
                              <>
                                <DropdownMenuItem onClick={() => navigate(`/site/transfers/${transfer._id || transfer.id}`)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => setConfirmApprove(transfer._id || transfer.id)}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                              </>
                            )}
                            {canReceive(transfer.status) && (
                              <DropdownMenuItem 
                                onClick={() => setConfirmReceive(transfer._id || transfer.id)}
                                className="text-blue-600"
                              >
                                <Package className="h-4 w-4 mr-2" />
                                Receive at Destination
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
              icon={ArrowRightLeft}
              title="No transfers found"
              description={
                searchQuery || statusFilter !== 'all'
                  ? "No transfers match your filters"
                  : "Transfer stock between project sites"
              }
              action={
                !searchQuery && statusFilter === 'all'
                  ? {
                      label: "Create Transfer",
                      onClick: () => navigate('/site/transfers/new'),
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
        title="Approve Transfer"
        description="This will approve the transfer and mark it as ready for dispatch. Continue?"
        confirmText="Approve"
        onConfirm={handleApprove}
      />

      <ConfirmDialog
        open={!!confirmReceive}
        onOpenChange={() => setConfirmReceive(null)}
        title="Receive Transfer"
        description="This will mark the transfer as received and update stock levels at the destination. Continue?"
        confirmText="Receive"
        onConfirm={handleReceive}
      />
    </div>
  );
}