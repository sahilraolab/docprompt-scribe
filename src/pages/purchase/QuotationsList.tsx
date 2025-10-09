import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuotations } from '@/lib/hooks/usePurchase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { exportData } from '@/lib/utils/export-enhanced';
import { Plus, Search, FileText, Loader2, Download, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function QuotationsList() {
  const navigate = useNavigate();
  const { data: quotations, isLoading } = useQuotations();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  const filteredQuotations = quotations
    ?.filter((quot) => {
      const matchesSearch = 
        quot.supplierName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quot.mrCode?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || quot.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'supplier') return (a.supplierName || '').localeCompare(b.supplierName || '');
      if (sortBy === 'amount') return calculateTotal(b) - calculateTotal(a);
      return 0;
    });

  const handleExport = () => {
    if (!filteredQuotations) return;
    const data = filteredQuotations.map((quot) => ({
      'Supplier': quot.supplierName,
      'MR Code': quot.mrCode,
      'Items': quot.items.length,
      'Total Amount': calculateTotal(quot),
      'Expires On': quot.expiresAt,
      'Date': quot.createdAt,
      'Status': quot.status,
    }));
    exportData(data, { filename: 'quotations', format: 'csv' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const calculateTotal = (quot: any) => {
    return quot.items.reduce((sum: number, item: any) => sum + item.amount, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quotations</h1>
          <p className="text-muted-foreground">Manage supplier quotations</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
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
          {filteredQuotations && filteredQuotations.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>MR Code</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Expires On</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotations.map((quot) => (
                    <TableRow key={quot.id}>
                      <TableCell className="font-medium">{quot.supplierName}</TableCell>
                      <TableCell>{quot.mrCode}</TableCell>
                      <TableCell>{quot.items.length} items</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(calculateTotal(quot))}
                      </TableCell>
                      <TableCell>{formatDate(quot.expiresAt)}</TableCell>
                      <TableCell>{formatDate(quot.createdAt)}</TableCell>
                      <TableCell>
                        <StatusBadge status={quot.status} />
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
              description={
                searchQuery
                  ? "No quotations match your search criteria"
                  : "Add quotations from suppliers"
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
