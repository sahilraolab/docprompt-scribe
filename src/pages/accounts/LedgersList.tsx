import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency } from '@/lib/utils/format';
import { Plus, Search, Book, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAccounts } from '@/lib/hooks/useAccounts';

export default function LedgersList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: accounts, isLoading } = useAccounts();

  const filteredLedgers = accounts?.filter((account) =>
    account.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.type.toLowerCase().includes(searchQuery.toLowerCase())
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
                    <TableHead>Parent Account</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLedgers.map((ledger) => (
                    <TableRow
                      key={ledger.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/accounts/ledgers/${ledger.id}`)}
                    >
                      <TableCell className="font-medium">{ledger.code}</TableCell>
                      <TableCell>{ledger.name}</TableCell>
                      <TableCell>
                        <Badge className={getTypeBadgeColor(ledger.type)} variant="secondary">
                          {ledger.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{ledger.parentName || '-'}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(ledger.balance)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={ledger.active ? 'default' : 'secondary'}>
                          {ledger.active ? 'Active' : 'Inactive'}
                        </Badge>
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
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
