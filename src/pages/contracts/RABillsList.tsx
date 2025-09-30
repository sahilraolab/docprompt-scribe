import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Plus, Search, Receipt } from 'lucide-react';
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

  // Mock data
  const raBills = [
    {
      id: '1',
      billNo: 'RA-001',
      woCode: 'WO-2024-001',
      contractorName: 'BuildPro Contractors',
      projectName: 'Green Valley Apartments',
      period: 'Jan 2024',
      amount: 850000,
      deductions: 45000,
      netAmount: 805000,
      status: 'Approved' as const,
      billDate: '2024-01-31',
    },
    {
      id: '2',
      billNo: 'RA-002',
      woCode: 'WO-2024-002',
      contractorName: 'Metro Builders',
      projectName: 'City Mall Extension',
      period: 'Jan 2024',
      amount: 1200000,
      deductions: 60000,
      netAmount: 1140000,
      status: 'Pending' as const,
      billDate: '2024-01-28',
    },
    {
      id: '3',
      billNo: 'RA-003',
      woCode: 'WO-2024-001',
      contractorName: 'BuildPro Contractors',
      projectName: 'Green Valley Apartments',
      period: 'Dec 2023',
      amount: 820000,
      deductions: 40000,
      netAmount: 780000,
      status: 'Active' as const,
      billDate: '2023-12-31',
    },
  ];

  const filteredBills = raBills.filter((bill) =>
    bill.billNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.woCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.contractorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                      key={bill.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/contracts/ra-bills/${bill.id}`)}
                    >
                      <TableCell className="font-medium">{bill.billNo}</TableCell>
                      <TableCell>{bill.woCode}</TableCell>
                      <TableCell>{bill.contractorName}</TableCell>
                      <TableCell>{bill.projectName}</TableCell>
                      <TableCell>{bill.period}</TableCell>
                      <TableCell>{formatCurrency(bill.amount)}</TableCell>
                      <TableCell className="text-destructive">
                        -{formatCurrency(bill.deductions)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(bill.netAmount)}
                      </TableCell>
                      <TableCell>{formatDate(bill.billDate)}</TableCell>
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
