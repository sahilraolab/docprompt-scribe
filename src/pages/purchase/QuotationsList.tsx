import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuotations } from '@/lib/hooks/usePurchase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Plus, Search, FileText, Loader2 } from 'lucide-react';
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

  const filteredQuotations = quotations?.filter((quot) =>
    quot.supplierName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quot.mrCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <Button onClick={() => navigate('/purchase/quotations/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Quotation
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by supplier or MR code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
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
                    <TableRow
                      key={quot.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/purchase/quotations/${quot.id}`)}
                    >
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
              action={
                !searchQuery
                  ? {
                      label: "Add Quotation",
                      onClick: () => navigate('/purchase/quotations/new'),
                    }
                  : undefined
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
