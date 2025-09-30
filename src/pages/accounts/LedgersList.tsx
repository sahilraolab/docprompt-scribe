import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency } from '@/lib/utils/format';
import { Plus, Search, Book } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function LedgersList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const ledgers = [
    {
      id: '1',
      accountCode: '1000',
      accountName: 'Cash in Hand',
      accountType: 'Asset',
      balance: 500000,
      balanceType: 'Debit',
    },
    {
      id: '2',
      accountCode: '1100',
      accountName: 'Bank - HDFC Current',
      accountType: 'Asset',
      balance: 2500000,
      balanceType: 'Debit',
    },
    {
      id: '3',
      accountCode: '1200',
      accountName: 'Accounts Receivable',
      accountType: 'Asset',
      balance: 1800000,
      balanceType: 'Debit',
    },
    {
      id: '4',
      accountCode: '2000',
      accountName: 'Accounts Payable',
      accountType: 'Liability',
      balance: 950000,
      balanceType: 'Credit',
    },
    {
      id: '5',
      accountCode: '2100',
      accountName: 'Contractor Payables',
      accountType: 'Liability',
      balance: 1200000,
      balanceType: 'Credit',
    },
    {
      id: '6',
      accountCode: '3000',
      accountName: 'Capital',
      accountType: 'Equity',
      balance: 5000000,
      balanceType: 'Credit',
    },
    {
      id: '7',
      accountCode: '4000',
      accountName: 'Project Revenue',
      accountType: 'Income',
      balance: 8500000,
      balanceType: 'Credit',
    },
    {
      id: '8',
      accountCode: '5000',
      accountName: 'Material Expenses',
      accountType: 'Expense',
      balance: 3200000,
      balanceType: 'Debit',
    },
    {
      id: '9',
      accountCode: '5100',
      accountName: 'Labour Expenses',
      accountType: 'Expense',
      balance: 2800000,
      balanceType: 'Debit',
    },
    {
      id: '10',
      accountCode: '5200',
      accountName: 'Equipment Rental',
      accountType: 'Expense',
      balance: 450000,
      balanceType: 'Debit',
    },
  ];

  const filteredLedgers = ledgers.filter((ledger) =>
    ledger.accountCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ledger.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ledger.accountType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Asset':
        return 'bg-blue-100 text-blue-800';
      case 'Liability':
        return 'bg-red-100 text-red-800';
      case 'Equity':
        return 'bg-purple-100 text-purple-800';
      case 'Income':
        return 'bg-green-100 text-green-800';
      case 'Expense':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Chart of Accounts</h1>
          <p className="text-muted-foreground">Manage ledger accounts and balances</p>
        </div>
        <Button onClick={() => navigate('/accounts/ledgers/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Account
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by account code, name, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredLedgers.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Code</TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Balance Type</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLedgers.map((ledger) => (
                    <TableRow
                      key={ledger.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/accounts/ledgers/${ledger.id}`)}
                    >
                      <TableCell className="font-medium">{ledger.accountCode}</TableCell>
                      <TableCell>{ledger.accountName}</TableCell>
                      <TableCell>
                        <Badge className={getTypeBadgeColor(ledger.accountType)} variant="secondary">
                          {ledger.accountType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ledger.balanceType}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(ledger.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={Book}
              title="No accounts found"
              description={
                searchQuery
                  ? "No accounts match your search criteria"
                  : "Create chart of accounts for financial management"
              }
              action={
                !searchQuery
                  ? {
                      label: "Create Account",
                      onClick: () => navigate('/accounts/ledgers/new'),
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
