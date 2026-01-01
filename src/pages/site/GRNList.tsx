import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGRNs, useApproveGRN } from '@/lib/hooks/useSite';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { formatDate } from '@/lib/utils/format';
import { Plus, Search, Package, Loader2, CheckCircle } from 'lucide-react';
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
import { MoreHorizontal, Eye, Edit, FileCheck } from 'lucide-react';

export default function GRNList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmApprove, setConfirmApprove] = useState<string | null>(null);
  const { data: grns = [], isLoading } = useGRNs();
  const { mutateAsync: approveGRN, isPending: isApproving } = useApproveGRN();

  const filteredGRNs = grns.filter((grn: any) => {
    const query = searchQuery.toLowerCase();
    return (
      grn.grnNo?.toLowerCase().includes(query) ||
      grn.poId?.code?.toLowerCase().includes(query) ||
      grn.poId?.supplierId?.name?.toLowerCase().includes(query) ||
      grn.poId?.projectId?.name?.toLowerCase().includes(query)
    );
  });

  const handleApprove = async () => {
    if (!confirmApprove) return;
    try {
      await approveGRN({ id: confirmApprove });
      setConfirmApprove(null);
    } catch (error) {
      console.error('Failed to approve GRN:', error);
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
          <h1 className="text-3xl font-bold">Goods Receipt Notes (GRN)</h1>
          <p className="text-muted-foreground">Track material receipts from approved Purchase Orders</p>
        </div>
        <Button onClick={() => navigate('/site/grn/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New GRN
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by GRN no, PO code, supplier, or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredGRNs.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>GRN No</TableHead>
                    <TableHead>PO Code</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>QC Status</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGRNs.map((grn: any) => (
                    <TableRow key={grn._id || grn.id}>
                      <TableCell className="font-medium">{grn.grnNo}</TableCell>
                      <TableCell>{grn.poId?.code || grn.poId?.poNo || 'N/A'}</TableCell>
                      <TableCell>{grn.poId?.supplierId?.name || 'N/A'}</TableCell>
                      <TableCell>{grn.poId?.projectId?.name || 'N/A'}</TableCell>
                      <TableCell>{grn.items?.length || 0} items</TableCell>
                      <TableCell>{formatDate(grn.grnDate)}</TableCell>
                      <TableCell>
                        <StatusBadge status={grn.qcStatus || 'Pending'} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={grn.status || 'Draft'} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/site/grn/${grn._id || grn.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            {canApprove(grn.status) && (
                              <>
                                <DropdownMenuItem onClick={() => navigate(`/site/grn/${grn._id || grn.id}`)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => setConfirmApprove(grn._id || grn.id)}
                                  className="text-green-600"
                                >
                                  <FileCheck className="h-4 w-4 mr-2" />
                                  Approve & Receive
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
              icon={Package}
              title="No GRNs found"
              description={
                searchQuery
                  ? "No GRNs match your search criteria"
                  : "Record goods receipts from approved purchase orders"
              }
              action={
                !searchQuery
                  ? {
                      label: "Create GRN",
                      onClick: () => navigate('/site/grn/new'),
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
        title="Approve & Receive GRN"
        description="This will approve the GRN, update stock levels, and lock it from further edits. Continue?"
        confirmText="Approve & Receive"
        onConfirm={handleApprove}
      />
    </div>
  );
}