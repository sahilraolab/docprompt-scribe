import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Plus, Search, Receipt, Loader2 } from 'lucide-react';
import { useRABills } from '@/lib/hooks/useContracts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function RABillsList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: raBills = [], isLoading } = useRABills();

  const filteredBills = raBills.filter((bill) => {
    const query = searchQuery.toLowerCase();
    return (
      bill.billNo?.toLowerCase().includes(query) ||
      bill.workOrderId?.code?.toLowerCase().includes(query) ||
      bill.workOrderId?.contractorId?.name?.toLowerCase().includes(query) ||
      bill.workOrderId?.projectId?.name?.toLowerCase().includes(query)
    );
  });

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
          <h1 className="text-3xl font-bold">RA Bills</h1>
          <p className="text-muted-foreground">Running Account bills for contractors</p>
        </div>
        <Button onClick={() => navigate('/contracts/ra-bills/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New RA Bill
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by bill no, WO code, contractor, or project..."
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
                    <TableHead>Bill No</TableHead>
                    <TableHead>WO Code</TableHead>
                    <TableHead>Contractor</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill) => (
                    <TableRow
                      key={bill._id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/contracts/ra-bills/${bill._id}`)}
                    >
                      <TableCell className="font-medium">{bill.billNo}</TableCell>
                      <TableCell>{bill.workOrderId?.code || 'N/A'}</TableCell>
                      <TableCell>{bill.workOrderId?.contractorId?.name || 'N/A'}</TableCell>
                      <TableCell>{bill.workOrderId?.projectId?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {formatDate(bill.fromDate)} - {formatDate(bill.toDate)}
                      </TableCell>
                      <TableCell>{formatCurrency(bill.gross)}</TableCell>
                      <TableCell className="text-destructive">
                        -{formatCurrency(bill.retention)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(bill.net)}
                      </TableCell>
                      <TableCell>{formatDate(bill.billDate)}</TableCell>
                      <TableCell>
                        <StatusBadge status={bill.status || 'Pending'} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={Receipt}
              title="No RA bills found"
              description={
                searchQuery
                  ? "No bills match your search criteria"
                  : "Create running account bills for contractor payments"
              }
              action={
                !searchQuery
                  ? {
                      label: "Create RA Bill",
                      onClick: () => navigate('/contracts/ra-bills/new'),
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
