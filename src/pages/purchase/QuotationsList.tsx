import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuotations } from '@/lib/hooks/usePurchaseBackend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { exportData } from '@/lib/utils/export-enhanced';
import { Plus, Search, FileText, Loader2, Download, Eye } from 'lucide-react';
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

export default function QuotationsList() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuotations();

  // Support both wrapped and direct data
  const quotations = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  const calculateTotal = (quotation: any) =>
    quotation.totalAmount ||
    quotation.items?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) ||
    0;

  const filteredQuotations = useMemo(() => {
    return quotations
      .filter((q: any) => {
        const supplier = q.supplierId?.name?.toLowerCase() || '';
        const mr = q.mrId?.code?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        const matchesSearch = supplier.includes(query) || mr.includes(query);
        const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a: any, b: any) => {
        if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === 'supplier') return (a.supplierId?.name || '').localeCompare(b.supplierId?.name || '');
        if (sortBy === 'amount') return calculateTotal(b) - calculateTotal(a);
        return 0;
      });
  }, [quotations, searchQuery, statusFilter, sortBy]);

  const handleExport = () => {
    if (!filteredQuotations.length) return;
    const rows = filteredQuotations.map((q: any) => ({
      'Quotation Code': q.code,
      'Supplier': q.supplierId?.name,
      'MR Code': q.mrId?.code,
      'Date': formatDate(q.quotationDate),
      'Amount': formatCurrency(calculateTotal(q)),
      'Status': q.status,
    }));
    exportData(rows, { filename: 'quotations', format: 'csv' });
  };

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
          <p className="text-muted-foreground">Manage supplier quotations</p>
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
                placeholder="Search by supplier or MR code..."
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
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Selected">Selected</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
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
                    <TableHead>MR Code</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotations.map((q: any) => (
                    <TableRow key={q._id}>
                      <TableCell>{q.code}</TableCell>
                      <TableCell>{q.supplierId?.name || '-'}</TableCell>
                      <TableCell>{q.mrId?.code || '-'}</TableCell>
                      <TableCell>{formatDate(q.quotationDate)}</TableCell>
                      <TableCell>{formatCurrency(calculateTotal(q))}</TableCell>
                      <TableCell><StatusBadge status={q.status} /></TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/purchase/quotations/${q._id}/view`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
    </div>
  );
}
