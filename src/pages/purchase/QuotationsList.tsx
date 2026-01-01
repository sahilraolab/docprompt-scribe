import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuotations, useApproveQuotation, useRejectQuotation, useCreatePO } from '@/lib/hooks/usePurchaseBackend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { exportData } from '@/lib/utils/export-enhanced';
import { Plus, Search, FileText, Loader2, Download, Eye, CheckCircle, XCircle, ShoppingCart, Lock } from 'lucide-react';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function QuotationsList() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuotations();
  const approveQuotation = useApproveQuotation();
  const rejectQuotation = useRejectQuotation();
  const createPO = useCreatePO();

  // Support both wrapped and direct data
  const quotations = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [approveConfirm, setApproveConfirm] = useState<string | null>(null);
  const [rejectConfirm, setRejectConfirm] = useState<string | null>(null);
  const [createPOConfirm, setCreatePOConfirm] = useState<any | null>(null);

  const calculateTotal = (quotation: any) =>
    quotation.totalAmount ||
    quotation.items?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) ||
    0;

  const filteredQuotations = useMemo(() => {
    return quotations
      .map((q: any) => ({
        ...q,
        id: q._id || q.id,
        supplierName: q.supplierId?.name || 'N/A',
        rfqCode: q.rfqId?.rfqNo || q.mrId?.code || 'N/A',
        total: calculateTotal(q),
      }))
      .filter((q: any) => {
        const supplier = q.supplierName.toLowerCase();
        const rfq = q.rfqCode.toLowerCase();
        const query = searchQuery.toLowerCase();
        const matchesSearch = supplier.includes(query) || rfq.includes(query) || (q.code || '').toLowerCase().includes(query);
        const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a: any, b: any) => {
        if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'supplier') return a.supplierName.localeCompare(b.supplierName);
        if (sortBy === 'amount') return b.total - a.total;
        return 0;
      });
  }, [quotations, searchQuery, statusFilter, sortBy]);

  const handleExport = () => {
    if (!filteredQuotations.length) return;
    const rows = filteredQuotations.map((q: any) => ({
      'Quotation Code': q.code,
      'Supplier': q.supplierName,
      'RFQ/MR Code': q.rfqCode,
      'Date': formatDate(q.quotationDate || q.createdAt),
      'Amount': formatCurrency(q.total),
      'Status': q.status,
    }));
    exportData(rows, { filename: 'quotations', format: 'csv' });
  };

  const handleApprove = (id: string) => {
    approveQuotation.mutate({ id }, {
      onSuccess: () => setApproveConfirm(null),
    });
  };

  const handleReject = (id: string) => {
    rejectQuotation.mutate({ id }, {
      onSuccess: () => setRejectConfirm(null),
    });
  };

  const handleCreatePO = (quotation: any) => {
    createPO.mutate({ quotationId: quotation.id }, {
      onSuccess: () => {
        setCreatePOConfirm(null);
        navigate('/purchase/pos');
      },
    });
  };

  const isLocked = (status: string) => status === 'APPROVED' || status === 'REJECTED' || status === 'Selected' || status === 'Rejected';

  if (isLoading)
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quotations</h1>
          <p className="text-muted-foreground">Manage supplier quotations and approvals</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Button onClick={() => navigate('/purchase/quotations/new')}>
            <Plus className="h-4 w-4 mr-2" /> New Quotation
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by supplier, code, or RFQ..."
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
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="supplier">Supplier</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredQuotations.length ? (
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>RFQ/MR</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotations.map((q: any) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {q.code}
                          {isLocked(q.status) && <Lock className="h-3 w-3 text-muted-foreground" />}
                        </div>
                      </TableCell>
                      <TableCell>{q.supplierName}</TableCell>
                      <TableCell>{q.rfqCode}</TableCell>
                      <TableCell>{formatDate(q.quotationDate || q.createdAt)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(q.total)}</TableCell>
                      <TableCell><StatusBadge status={q.status} /></TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/purchase/quotations/${q.id}/view`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            
                            {(q.status === 'SUBMITTED' || q.status === 'Draft') && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setApproveConfirm(q.id)}>
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setRejectConfirm(q.id)} className="text-destructive">
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            
                            {(q.status === 'APPROVED' || q.status === 'Selected') && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setCreatePOConfirm(q)}>
                                  <ShoppingCart className="h-4 w-4 mr-2 text-primary" />
                                  Create PO
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
              icon={FileText}
              title="No quotations found"
              description="Create a new quotation to get started."
            />
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <ConfirmDialog
        open={!!approveConfirm}
        onOpenChange={() => setApproveConfirm(null)}
        title="Approve Quotation"
        description="This will approve the quotation and close the associated RFQ. You can then create a Purchase Order from this quotation."
        confirmText="Approve"
        onConfirm={() => approveConfirm && handleApprove(approveConfirm)}
      />

      {/* Reject Dialog */}
      <ConfirmDialog
        open={!!rejectConfirm}
        onOpenChange={() => setRejectConfirm(null)}
        title="Reject Quotation"
        description="Are you sure you want to reject this quotation? This action cannot be undone."
        confirmText="Reject"
        variant="destructive"
        onConfirm={() => rejectConfirm && handleReject(rejectConfirm)}
      />

      {/* Create PO Dialog */}
      <ConfirmDialog
        open={!!createPOConfirm}
        onOpenChange={() => setCreatePOConfirm(null)}
        title="Create Purchase Order"
        description={`Create a Purchase Order from quotation ${createPOConfirm?.code || ''}? This will generate a new PO with the quoted items and prices.`}
        confirmText="Create PO"
        onConfirm={() => createPOConfirm && handleCreatePO(createPOConfirm)}
      />
    </div>
  );
}
