import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { exportData } from '@/lib/utils/export-enhanced';
import { Plus, Search, Receipt, Loader2, Download, Send, Lock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePurchaseBills, usePostPurchaseBill } from '@/lib/hooks/usePurchaseBackend';
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
import { MoreHorizontal, Eye } from 'lucide-react';

export default function PurchaseBillsList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [postConfirm, setPostConfirm] = useState<string | null>(null);

  const { data: bills, isLoading } = usePurchaseBills();
  const postBill = usePostPurchaseBill();

  const filteredBills = useMemo(() => {
    if (!bills) return [];

    return bills
      .map((bill: any) => ({
        ...bill,
        id: bill._id || bill.id,
        poCode: bill.poId?.code || '',
        invoiceNo: bill.invoiceNo || bill.billNo || '',
        invoiceDate: bill.invoiceDate || bill.billDate || bill.createdAt,
        amount: bill.amount || bill.basicAmount || 0,
        tax: bill.tax || bill.taxAmount || 0,
        total: bill.total || bill.totalAmount || 0,
      }))
      .filter((bill: any) => {
        const matchesSearch =
          bill.poCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bill.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a: any, b: any) => {
        if (sortBy === 'date') return new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime();
        if (sortBy === 'amount') return b.total - a.total;
        if (sortBy === 'invoice') return a.invoiceNo.localeCompare(b.invoiceNo);
        return 0;
      });
  }, [bills, searchQuery, statusFilter, sortBy]);

  const handleExport = () => {
    if (!filteredBills?.length) return;
    const data = filteredBills.map((bill: any) => ({
      'Invoice No': bill.invoiceNo,
      'PO Code': bill.poCode,
      'Invoice Date': formatDate(bill.invoiceDate),
      'Amount': bill.amount,
      'Tax': bill.tax,
      'Total': bill.total,
      'Status': bill.status,
    }));
    exportData(data, { filename: 'purchase-bills', format: 'csv' });
  };

  const handlePost = (id: string) => {
    postBill.mutate(id, {
      onSuccess: () => setPostConfirm(null),
    });
  };

  const isPosted = (status: string) => status === 'POSTED' || status === 'Posted';

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
          <h1 className="text-3xl font-bold">Purchase Bills</h1>
          <p className="text-muted-foreground">Manage supplier invoices and post to accounts</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => navigate('/purchase/bills/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Bill
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by PO code or invoice number..."
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
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="POSTED">Posted</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="invoice">Invoice No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {filteredBills.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice No</TableHead>
                    <TableHead>PO Code</TableHead>
                    <TableHead>Invoice Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Tax</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill: any) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {bill.invoiceNo}
                          {isPosted(bill.status) && <Lock className="h-3 w-3 text-muted-foreground" />}
                        </div>
                      </TableCell>
                      <TableCell>{bill.poCode || '-'}</TableCell>
                      <TableCell>{formatDate(bill.invoiceDate)}</TableCell>
                      <TableCell>{formatCurrency(bill.amount)}</TableCell>
                      <TableCell>{formatCurrency(bill.tax)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(bill.total)}</TableCell>
                      <TableCell><StatusBadge status={bill.status} /></TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/purchase/bills/${bill.id}/view`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {(bill.status === 'APPROVED' || bill.status === 'Approved') && (
                              <DropdownMenuItem onClick={() => setPostConfirm(bill.id)}>
                                <Send className="h-4 w-4 mr-2 text-primary" />
                                Post to Accounts
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
              icon={Receipt}
              title="No purchase bills found"
              description="Record supplier invoices and manage payments"
              action={{
                label: 'Add Bill',
                onClick: () => navigate('/purchase/bills/new'),
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Post Confirmation */}
      <ConfirmDialog
        open={!!postConfirm}
        onOpenChange={() => setPostConfirm(null)}
        title="Post to Accounts"
        description="This will post the purchase bill to accounts and create the corresponding journal entry. This action cannot be undone."
        confirmText="Post to Accounts"
        onConfirm={() => postConfirm && handlePost(postConfirm)}
      />
    </div>
  );
}
