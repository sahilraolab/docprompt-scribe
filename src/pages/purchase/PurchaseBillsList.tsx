import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Plus, Search, Receipt, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function PurchaseBillsList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - will be replaced with real API
  const bills = [
    {
      id: '1',
      poCode: 'PO-2024-001',
      invoiceNo: 'INV-001',
      invoiceDate: '2024-01-15',
      amount: 450000,
      tax: 81000,
      total: 531000,
      status: 'Active' as const
    },
    {
      id: '2',
      poCode: 'PO-2024-002',
      invoiceNo: 'INV-002',
      invoiceDate: '2024-01-20',
      amount: 280000,
      tax: 50400,
      total: 330400,
      status: 'Pending' as const
    }
  ];

  const filteredBills = bills.filter((bill) =>
    bill.poCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Purchase Bills</h1>
          <p className="text-muted-foreground">Manage supplier invoices and bills</p>
        </div>
        <Button onClick={() => navigate('/purchase/bills/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Bill
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by PO code or invoice number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill) => (
                    <TableRow
                      key={bill.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/purchase/bills/${bill.id}`)}
                    >
                      <TableCell className="font-medium">{bill.invoiceNo}</TableCell>
                      <TableCell>{bill.poCode}</TableCell>
                      <TableCell>{formatDate(bill.invoiceDate)}</TableCell>
                      <TableCell>{formatCurrency(bill.amount)}</TableCell>
                      <TableCell>{formatCurrency(bill.tax)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(bill.total)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={bill.status} />
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
              description={
                searchQuery
                  ? "No bills match your search criteria"
                  : "Record supplier invoices and manage payments"
              }
              action={
                !searchQuery
                  ? {
                      label: "Add Bill",
                      onClick: () => navigate('/purchase/bills/new'),
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
